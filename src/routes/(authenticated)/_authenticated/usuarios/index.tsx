import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { GuardedView } from '@/components/guarded-view'
import { ApiError } from '@/lib/api-core'
import { UserCreateForm } from '@/routes/(authenticated)/_authenticated/usuarios/components/user-create-form'
import { UserEditForm } from '@/routes/(authenticated)/_authenticated/usuarios/components/user-edit-form'
import { UserView } from '@/routes/(authenticated)/_authenticated/usuarios/components/user-view'
import { UsersList } from '@/routes/(authenticated)/_authenticated/usuarios/components/users-list'
import { useUserActions } from '@/routes/(authenticated)/_authenticated/usuarios/hooks/use-user-actions'
import { useUsersList } from '@/routes/(authenticated)/_authenticated/usuarios/hooks/use-users-list'

export const Route = createFileRoute('/(authenticated)/_authenticated/usuarios/')({
  component: UsersPage,
})

function UsersPage() {
  const userActions = useUserActions()
  const usersList = useUsersList({
    onEditUser: userActions.openEdit,
    onViewUser: userActions.openView,
  })

  const selectedUserErrorMessage = useMemo(() => {
    if (userActions.selectedUserQuery.error instanceof ApiError) {
      return userActions.selectedUserQuery.error.message
    }

    return null
  }, [userActions.selectedUserQuery.error])

  const usersErrorMessage = useMemo(() => {
    if (usersList.usersQuery.error instanceof ApiError) {
      return usersList.usersQuery.error.message
    }

    return null
  }, [usersList.usersQuery.error])

  return (
    <GuardedView requireAdmin>
      <AppShell
        title="Usuarios"
        description="Listagem, filtros, ordenacao, paginacao, criacao, visualizacao e edicao seguindo os contratos reais de `/api/users`."
      >
        <UsersList
          applyFilters={usersList.applyFilters}
          currentPage={usersList.usersQuery.data?.meta.page || usersList.filters.page}
          draftAtivo={usersList.draftAtivo}
          draftPerfil={usersList.draftPerfil}
          draftSearch={usersList.draftSearch}
          errorMessage={usersErrorMessage}
          feedbackMessage={userActions.feedbackMessage}
          isLoading={usersList.usersQuery.isLoading}
          onCreateUser={userActions.openCreate}
          onDraftAtivoChange={usersList.setDraftAtivo}
          onDraftPerfilChange={usersList.setDraftPerfil}
          onDraftSearchChange={usersList.setDraftSearch}
          onNextPage={() =>
            usersList.setFilters((current) => ({
              ...current,
              page: current.page + 1,
            }))
          }
          onPreviousPage={() =>
            usersList.setFilters((current) => ({
              ...current,
              page: Math.max(1, current.page - 1),
            }))
          }
          table={usersList.table}
          totalPages={usersList.usersQuery.data?.meta.totalPages || 1}
        />

        {userActions.drawerMode ? (
          <section className="drawer-backdrop" onClick={userActions.closeDrawer}>
            <article
              className="drawer-card"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="panel-header">
                <span className="page-kicker">
                  {userActions.drawerMode === 'create'
                    ? 'Criacao'
                    : userActions.drawerMode === 'edit'
                      ? 'Edicao'
                      : 'Visualizacao'}
                </span>
                <h2>Usuario</h2>
                <p>
                  {userActions.drawerMode === 'create'
                    ? 'Cria um usuario com `deveAlterarSenha=true` e senha padrao local quando nenhuma senha for enviada.'
                    : 'Consome o detalhe real do usuario antes de salvar alteracoes.'}
                </p>
              </div>

              {userActions.selectedUserQuery.isLoading &&
              userActions.drawerMode !== 'create' ? (
                <p>Carregando usuario...</p>
              ) : null}

              {selectedUserErrorMessage ? (
                <p className="form-error">{selectedUserErrorMessage}</p>
              ) : null}

              {userActions.drawerMode === 'view' && userActions.selectedUserQuery.data ? (
                <UserView user={userActions.selectedUserQuery.data} />
              ) : null}

              {userActions.drawerMode === 'create' ? (
                <UserCreateForm
                  formError={userActions.formError}
                  formState={userActions.formState}
                  isPending={userActions.saveUserMutation.isPending}
                  onCancel={userActions.closeDrawer}
                  onChange={userActions.setFormState}
                  onSubmit={userActions.submitForm}
                />
              ) : null}

              {userActions.drawerMode === 'edit' ? (
                <UserEditForm
                  formError={userActions.formError}
                  formState={userActions.formState}
                  isPending={userActions.saveUserMutation.isPending}
                  onCancel={userActions.closeDrawer}
                  onChange={userActions.setFormState}
                  onSubmit={userActions.submitForm}
                />
              ) : null}

              {userActions.selectedUserId && userActions.drawerMode !== 'create' ? (
                <div className="drawer-actions secondary-actions">
                  {userActions.selectedUserQuery.data ? (
                    <>
                      <button
                        className="ghost-button"
                        disabled={userActions.statusMutation.isPending}
                        onClick={() =>
                          userActions.statusMutation.mutate({
                            id: userActions.selectedUserId as number,
                            ativo: !userActions.selectedUserQuery.data?.ativo,
                          })
                        }
                        type="button"
                      >
                        {userActions.selectedUserQuery.data.ativo ? 'Inativar' : 'Ativar'}
                      </button>

                      <button
                        className="ghost-button"
                        disabled={userActions.resetPasswordMutation.isPending}
                        onClick={() =>
                          userActions.resetPasswordMutation.mutate(
                            userActions.selectedUserId as number,
                          )
                        }
                        type="button"
                      >
                        Resetar senha
                      </button>
                    </>
                  ) : null}

                  <button
                    className="ghost-button"
                    onClick={userActions.closeDrawer}
                    type="button"
                  >
                    Fechar
                  </button>
                </div>
              ) : null}
            </article>
          </section>
        ) : null}
      </AppShell>
    </GuardedView>
  )
}
