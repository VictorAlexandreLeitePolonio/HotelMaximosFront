/// <reference types="cypress" />

describe('Sprint 1 auth and users flow', () => {
  it('redirects anonymous access to login', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
    cy.contains('Entrar').should('be.visible')
  })

  it('forces password change before opening the dashboard', () => {
    cy.intercept('POST', 'http://localhost:3333/api/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'token-inicial',
        refreshToken: 'refresh-inicial',
        user: {
          id: 1,
          login: 'admin',
          nomeCompleto: 'Administrador Local',
          email: null,
          perfil: 'Admin',
          ativo: true,
          deveAlterarSenha: true,
        },
      },
    }).as('login')

    cy.intercept('PATCH', 'http://localhost:3333/api/auth/password', {
      statusCode: 204,
      headers: {
        'content-type': 'application/json',
      },
      body: null,
    }).as('changePassword')

    cy.visit('/login')
    cy.get('input[name="login"]').type('admin')
    cy.get('input[name="senha"]').type('Admin123!')
    cy.contains('button', 'Entrar').click()

    cy.wait('@login')
    cy.url().should('include', '/perfil')

    cy.get('input[autocomplete="current-password"]').type('Admin123!')
    cy.get('input[autocomplete="new-password"]').first().type('NovaSenha123!')
    cy.get('input[autocomplete="new-password"]').last().type('NovaSenha123!')
    cy.contains('button', 'Alterar senha').click()

    cy.wait('@changePassword')
    cy.url().should('include', '/dashboard')
  })

  it('lists, creates and edits users as admin', () => {
    let users = [
      {
        id: 1,
        login: 'admin',
        nomeCompleto: 'Administrador Local',
        email: null,
        perfil: 'Admin',
        ativo: true,
        deveAlterarSenha: false,
        criadoEm: '2026-05-15T12:00:00.000Z',
        atualizadoEm: '2026-05-15T12:00:00.000Z',
      },
      {
        id: 2,
        login: 'recepcao',
        nomeCompleto: 'Recepcao Hotel',
        email: 'recepcao@hotel.com',
        perfil: 'Recepcionista',
        ativo: true,
        deveAlterarSenha: true,
        criadoEm: '2026-05-15T12:00:00.000Z',
        atualizadoEm: '2026-05-15T12:00:00.000Z',
      },
    ]

    cy.intercept('POST', 'http://localhost:3333/api/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'token-admin',
        refreshToken: 'refresh-admin',
        user: {
          id: 1,
          login: 'admin',
          nomeCompleto: 'Administrador Local',
          email: null,
          perfil: 'Admin',
          ativo: true,
          deveAlterarSenha: false,
        },
      },
    }).as('login')

    cy.intercept('GET', 'http://localhost:3333/api/users?*', (request: any) => {
      const search = request.query.search as string | undefined

      const filtered = search
        ? users.filter((user) =>
            [user.login, user.nomeCompleto, user.email || '']
              .join(' ')
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
        : users

      request.reply({
        statusCode: 200,
        body: {
          data: filtered,
          meta: {
            page: 1,
            pageSize: 10,
            total: filtered.length,
            totalPages: 1,
          },
        },
      })
    }).as('listUsers')

    cy.intercept('GET', 'http://localhost:3333/api/users/2', {
      statusCode: 200,
      body: users[1],
    }).as('getUser')

    cy.intercept('POST', 'http://localhost:3333/api/users', (request: any) => {
      const createdUser = {
        id: 3,
        login: request.body.login,
        nomeCompleto: request.body.nomeCompleto,
        email: request.body.email,
        perfil: request.body.perfil,
        ativo: true,
        deveAlterarSenha: true,
        criadoEm: '2026-05-15T12:00:00.000Z',
        atualizadoEm: '2026-05-15T12:00:00.000Z',
      }

      users = [...users, createdUser]
      request.reply({
        statusCode: 201,
        body: createdUser,
      })
    }).as('createUser')

    cy.intercept('PUT', 'http://localhost:3333/api/users/2', (request: any) => {
      users = users.map((user) =>
        user.id === 2
          ? {
              ...user,
              ...request.body,
              atualizadoEm: '2026-05-15T13:00:00.000Z',
            }
          : user,
      )

      request.reply({
        statusCode: 200,
        body: users.find((user) => user.id === 2),
      })
    }).as('updateUser')

    cy.visit('/login')
    cy.get('input[name="login"]').type('admin')
    cy.get('input[name="senha"]').type('Admin123!')
    cy.contains('button', 'Entrar').click()
    cy.wait('@login')

    cy.contains('Usuarios').click()
    cy.wait('@listUsers')
    cy.contains('Recepcao Hotel').should('be.visible')

    cy.contains('button', 'Novo usuario').click()
    cy.get('.drawer-card').within(() => {
      cy.get('input').eq(0).type('novo.usuario')
      cy.get('input').eq(1).type('Novo Usuario')
      cy.get('input').eq(2).type('novo@hotel.com')
      cy.get('select').select('Recepcionista')
      cy.get('input[type="password"]').type('NovaSenha123!')
      cy.contains('button', 'Salvar').click()
    })

    cy.wait('@createUser')
    cy.contains('Usuario novo.usuario criado com sucesso.').should('be.visible')
    cy.wait('@listUsers')
    cy.contains('novo.usuario').should('be.visible')

    cy.contains('tr', 'Recepcao Hotel').within(() => {
      cy.contains('button', 'Editar').click()
    })

    cy.wait('@getUser')
    cy.get('.drawer-card').within(() => {
      cy.get('input').eq(1).clear().type('Recepcao Atualizada')
      cy.contains('button', 'Salvar').click()
    })

    cy.wait('@updateUser')
    cy.contains('Usuario recepcao atualizado com sucesso.').should('be.visible')
    cy.wait('@listUsers')
    cy.contains('Recepcao Atualizada').should('be.visible')
  })
})
