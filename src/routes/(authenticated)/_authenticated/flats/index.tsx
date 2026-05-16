import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { GuardedView } from '@/components/guarded-view'
import { ApiError } from '@/lib/api-core'
import { FlatForm } from '@/routes/(authenticated)/_authenticated/flats/components/flat-form'
import { FlatsList } from '@/routes/(authenticated)/_authenticated/flats/components/flats-list'
import { FlatView } from '@/routes/(authenticated)/_authenticated/flats/components/flat-view'
import { useFlatActions } from '@/routes/(authenticated)/_authenticated/flats/hooks/use-flat-actions'
import { useFlatsList } from '@/routes/(authenticated)/_authenticated/flats/hooks/use-flats-list'

export const Route = createFileRoute('/(authenticated)/_authenticated/flats/')({
  component: FlatsPage,
})

function FlatsPage() {
  const flatActions = useFlatActions()
  const flatsList = useFlatsList({
    onEditFlat: flatActions.openEdit,
    onViewFlat: flatActions.openView,
  })

  const selectedFlatErrorMessage = useMemo(() => {
    if (flatActions.selectedFlatQuery.error instanceof ApiError) {
      return flatActions.selectedFlatQuery.error.message
    }

    return flatActions.formError
  }, [flatActions.formError, flatActions.selectedFlatQuery.error])

  const listErrorMessage = useMemo(() => {
    if (flatsList.flatsQuery.error instanceof ApiError) {
      return flatsList.flatsQuery.error.message
    }

    return null
  }, [flatsList.flatsQuery.error])

  return (
    <GuardedView requireAdmin>
      <AppShell
        title="Flats"
        description="Sprint 3 do front preparada para `/api/flats`, consumindo categorias e subcategorias reais para montar a base operacional das unidades."
      >
        <FlatsList
          applyFilters={flatsList.applyFilters}
          categoriasOptions={flatsList.categoriasOptions}
          currentPage={flatsList.flatsQuery.data?.meta.page || flatsList.filters.page}
          draftAtivo={flatsList.draftAtivo}
          draftCategoriaId={flatsList.draftCategoriaId}
          draftSearch={flatsList.draftSearch}
          draftStatusOperacional={flatsList.draftStatusOperacional}
          draftSubcategoriaId={flatsList.draftSubcategoriaId}
          errorMessage={listErrorMessage}
          feedbackMessage={flatActions.feedbackMessage}
          flatOperationalStatuses={flatsList.flatOperationalStatuses}
          isLoading={flatsList.flatsQuery.isLoading}
          onCreateFlat={flatActions.openCreate}
          onDraftAtivoChange={flatsList.setDraftAtivo}
          onDraftCategoriaChange={flatsList.handleDraftCategoriaChange}
          onDraftSearchChange={flatsList.setDraftSearch}
          onDraftStatusChange={flatsList.setDraftStatusOperacional}
          onDraftSubcategoriaChange={flatsList.setDraftSubcategoriaId}
          onNextPage={() =>
            flatsList.setFilters((current) => ({
              ...current,
              page: current.page + 1,
            }))
          }
          onPreviousPage={() =>
            flatsList.setFilters((current) => ({
              ...current,
              page: Math.max(1, current.page - 1),
            }))
          }
          subcategoriasOptions={flatsList.subcategoriasOptions}
          table={flatsList.table}
          totalPages={flatsList.flatsQuery.data?.meta.totalPages || 1}
        />

        {flatActions.drawerMode ? (
          <section className="drawer-backdrop" onClick={flatActions.closeDrawer}>
            <article className="drawer-card" onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <span className="page-kicker">
                  {flatActions.drawerMode === 'create'
                    ? 'Criacao'
                    : flatActions.drawerMode === 'edit'
                      ? 'Edicao'
                      : 'Visualizacao'}
                </span>
                <h2>Flat</h2>
                <p>
                  O flat fica vinculado a uma subcategoria com preco base e capacidade definidos. Regras de bloqueio por reserva futura ou ocupacao seguem vindo do backend como erro estruturado.
                </p>
              </div>

              {flatActions.selectedFlatQuery.isLoading && flatActions.drawerMode !== 'create' ? (
                <p>Carregando flat...</p>
              ) : null}

              {selectedFlatErrorMessage ? (
                <p className="form-error">{selectedFlatErrorMessage}</p>
              ) : null}

              {flatActions.drawerMode === 'view' && flatActions.selectedFlatQuery.data ? (
                <FlatView flat={flatActions.selectedFlatQuery.data} />
              ) : null}

              {flatActions.drawerMode === 'create' || flatActions.drawerMode === 'edit' ? (
                <FlatForm
                  categorias={flatActions.categoriasOptionsQuery.data?.data || []}
                  formError={flatActions.formError}
                  formState={flatActions.formState}
                  isPending={flatActions.saveFlatMutation.isPending}
                  onCancel={flatActions.closeDrawer}
                  onChange={flatActions.handleFormStateChange}
                  onSubmit={flatActions.submitForm}
                  subcategorias={flatActions.subcategoriasOptionsQuery.data?.data || []}
                />
              ) : null}

              {flatActions.selectedFlatId && flatActions.drawerMode !== 'create' ? (
                <div className="drawer-actions secondary-actions">
                  {flatActions.selectedFlatQuery.data?.ativo ? (
                    <button
                      className="ghost-button"
                      disabled={flatActions.deleteFlatMutation.isPending}
                      onClick={() =>
                        flatActions.deleteFlatMutation.mutate(flatActions.selectedFlatId as number)
                      }
                      type="button"
                    >
                      Inativar flat
                    </button>
                  ) : null}

                  <button className="ghost-button" onClick={flatActions.closeDrawer} type="button">
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
