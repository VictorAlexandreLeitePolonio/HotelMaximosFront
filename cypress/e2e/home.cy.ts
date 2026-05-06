describe('Hotel Maximos home', () => {
  it('renders the Sprint 0 shell', () => {
    cy.visit('/')
    cy.contains('Hotel Maximos').should('be.visible')
    cy.contains('TanStack Start').should('be.visible')
  })
})
