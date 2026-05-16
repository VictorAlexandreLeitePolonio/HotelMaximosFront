import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { GuardedView } from '@/components/guarded-view'
import { ApiError } from '@/lib/api-core'
import { CategoriaForm } from '@/routes/(authenticated)/_authenticated/categorias/components/categoria-form'
import { CategoriasList } from '@/routes/(authenticated)/_authenticated/categorias/components/categorias-list'
import { CategoriaView } from '@/routes/(authenticated)/_authenticated/categorias/components/categoria-view'
import { SubcategoriaForm } from '@/routes/(authenticated)/_authenticated/categorias/components/subcategoria-form'
import { SubcategoriaView } from '@/routes/(authenticated)/_authenticated/categorias/components/subcategoria-view'
import { useCategoriaActions } from '@/routes/(authenticated)/_authenticated/categorias/hooks/use-categoria-actions'
import { useCategoriasList } from '@/routes/(authenticated)/_authenticated/categorias/hooks/use-categorias-list'

export const Route = createFileRoute('/(authenticated)/_authenticated/categorias/')({
  component: CategoriasPage,
})

function CategoriasPage() {
  const categoriaActions = useCategoriaActions()
  const categoriasList = useCategoriasList({
    onEditCategoria: categoriaActions.openEditCategoria,
    onViewCategoria: categoriaActions.openViewCategoria,
    onEditSubcategoria: categoriaActions.openEditSubcategoria,
    onViewSubcategoria: categoriaActions.openViewSubcategoria,
  })

  const selectedCategoriaErrorMessage = useMemo(() => {
    if (categoriaActions.selectedCategoriaQuery.error instanceof ApiError) {
      return categoriaActions.selectedCategoriaQuery.error.message
    }

    return categoriaActions.formError
  }, [categoriaActions.formError, categoriaActions.selectedCategoriaQuery.error])

  const selectedSubcategoriaErrorMessage = useMemo(() => {
    if (categoriaActions.selectedSubcategoriaQuery.error instanceof ApiError) {
      return categoriaActions.selectedSubcategoriaQuery.error.message
    }

    return categoriaActions.formError
  }, [categoriaActions.formError, categoriaActions.selectedSubcategoriaQuery.error])

  const listErrorMessage = useMemo(() => {
    if (categoriasList.categoriasQuery.error instanceof ApiError) {
      return categoriasList.categoriasQuery.error.message
    }

    if (categoriasList.subcategoriasQuery.error instanceof ApiError) {
      return categoriasList.subcategoriasQuery.error.message
    }

    return null
  }, [categoriasList.categoriasQuery.error, categoriasList.subcategoriasQuery.error])

  return (
    <GuardedView requireAdmin>
      <AppShell
        title="Categorias e subcategorias"
        description="Sprint 3 do front preparada para os contratos REST de `/api/categorias` e `/api/subcategorias`, com filtros, paginacao, detalhe e regras administrativas alinhadas ao modulo de flats."
      >
        <CategoriasList
          applyCategoriasFilters={categoriasList.applyCategoriasFilters}
          applySubcategoriasFilters={categoriasList.applySubcategoriasFilters}
          categoriaCurrentPage={
            categoriasList.categoriasQuery.data?.meta.page || categoriasList.categoriaFilters.page
          }
          categoriaTotalPages={categoriasList.categoriasQuery.data?.meta.totalPages || 1}
          categoriasTable={categoriasList.categoriasTable}
          draftCategoriaAtivo={categoriasList.draftCategoriaAtivo}
          draftCategoriaSearch={categoriasList.draftCategoriaSearch}
          draftSubcategoriaAtivo={categoriasList.draftSubcategoriaAtivo}
          draftSubcategoriaSearch={categoriasList.draftSubcategoriaSearch}
          errorMessage={listErrorMessage}
          feedbackMessage={categoriaActions.feedbackMessage}
          isCategoriasLoading={categoriasList.categoriasQuery.isLoading}
          isSubcategoriasLoading={
            categoriasList.selectedCategoriaId !== null &&
            categoriasList.subcategoriasQuery.isLoading
          }
          onCreateCategoria={categoriaActions.openCreateCategoria}
          onCreateSubcategoria={() =>
            categoriaActions.openCreateSubcategoria(categoriasList.selectedCategoriaId)
          }
          onDraftCategoriaAtivoChange={categoriasList.setDraftCategoriaAtivo}
          onDraftCategoriaSearchChange={categoriasList.setDraftCategoriaSearch}
          onDraftSubcategoriaAtivoChange={categoriasList.setDraftSubcategoriaAtivo}
          onDraftSubcategoriaSearchChange={categoriasList.setDraftSubcategoriaSearch}
          onNextCategoriaPage={() =>
            categoriasList.setCategoriaFilters((current) => ({
              ...current,
              page: current.page + 1,
            }))
          }
          onNextSubcategoriaPage={() =>
            categoriasList.setSubcategoriaFilters((current) => ({
              ...current,
              page: current.page + 1,
            }))
          }
          onPreviousCategoriaPage={() =>
            categoriasList.setCategoriaFilters((current) => ({
              ...current,
              page: Math.max(1, current.page - 1),
            }))
          }
          onPreviousSubcategoriaPage={() =>
            categoriasList.setSubcategoriaFilters((current) => ({
              ...current,
              page: Math.max(1, current.page - 1),
            }))
          }
          selectedCategoriaNome={categoriasList.selectedCategoria?.nome || null}
          subcategoriaCurrentPage={
            categoriasList.subcategoriasQuery.data?.meta.page ||
            categoriasList.subcategoriaFilters.page
          }
          subcategoriaTotalPages={categoriasList.subcategoriasQuery.data?.meta.totalPages || 1}
          subcategoriasTable={categoriasList.subcategoriasTable}
        />

        {categoriaActions.categoriaDrawerMode ? (
          <section className="drawer-backdrop" onClick={categoriaActions.closeCategoriaDrawer}>
            <article className="drawer-card" onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <span className="page-kicker">
                  {categoriaActions.categoriaDrawerMode === 'create'
                    ? 'Criacao'
                    : categoriaActions.categoriaDrawerMode === 'edit'
                      ? 'Edicao'
                      : 'Visualizacao'}
                </span>
                <h2>Categoria</h2>
                <p>
                  Use este cadastro para organizar subcategorias e impedir combinacoes soltas entre flats e precificacao.
                </p>
              </div>

              {categoriaActions.selectedCategoriaQuery.isLoading &&
              categoriaActions.categoriaDrawerMode !== 'create' ? (
                <p>Carregando categoria...</p>
              ) : null}

              {selectedCategoriaErrorMessage ? (
                <p className="form-error">{selectedCategoriaErrorMessage}</p>
              ) : null}

              {categoriaActions.categoriaDrawerMode === 'view' &&
              categoriaActions.selectedCategoriaQuery.data ? (
                <CategoriaView categoria={categoriaActions.selectedCategoriaQuery.data} />
              ) : null}

              {categoriaActions.categoriaDrawerMode === 'create' ||
              categoriaActions.categoriaDrawerMode === 'edit' ? (
                <CategoriaForm
                  formError={categoriaActions.formError}
                  formState={categoriaActions.categoriaFormState}
                  isPending={categoriaActions.saveCategoriaMutation.isPending}
                  onCancel={categoriaActions.closeCategoriaDrawer}
                  onChange={categoriaActions.setCategoriaFormState}
                  onSubmit={categoriaActions.submitCategoriaForm}
                />
              ) : null}

              {categoriaActions.selectedCategoriaId &&
              categoriaActions.categoriaDrawerMode !== 'create' ? (
                <div className="drawer-actions secondary-actions">
                  {categoriaActions.selectedCategoriaQuery.data?.ativo ? (
                    <button
                      className="ghost-button"
                      disabled={categoriaActions.deleteCategoriaMutation.isPending}
                      onClick={() =>
                        categoriaActions.deleteCategoriaMutation.mutate(
                          categoriaActions.selectedCategoriaId as number,
                        )
                      }
                      type="button"
                    >
                      Inativar categoria
                    </button>
                  ) : null}

                  <button
                    className="ghost-button"
                    onClick={categoriaActions.closeCategoriaDrawer}
                    type="button"
                  >
                    Fechar
                  </button>
                </div>
              ) : null}
            </article>
          </section>
        ) : null}

        {categoriaActions.subcategoriaDrawerMode ? (
          <section className="drawer-backdrop" onClick={categoriaActions.closeSubcategoriaDrawer}>
            <article className="drawer-card" onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <span className="page-kicker">
                  {categoriaActions.subcategoriaDrawerMode === 'create'
                    ? 'Criacao'
                    : categoriaActions.subcategoriaDrawerMode === 'edit'
                      ? 'Edicao'
                      : 'Visualizacao'}
                </span>
                <h2>Subcategoria</h2>
                <p>
                  Defina preco base e capacidade maxima aqui. O backend fica responsavel por bloquear alteracoes indevidas quando houver ocupacao ou reserva futura.
                </p>
              </div>

              {categoriaActions.selectedSubcategoriaQuery.isLoading &&
              categoriaActions.subcategoriaDrawerMode !== 'create' ? (
                <p>Carregando subcategoria...</p>
              ) : null}

              {selectedSubcategoriaErrorMessage ? (
                <p className="form-error">{selectedSubcategoriaErrorMessage}</p>
              ) : null}

              {categoriaActions.subcategoriaDrawerMode === 'view' &&
              categoriaActions.selectedSubcategoriaQuery.data ? (
                <SubcategoriaView subcategoria={categoriaActions.selectedSubcategoriaQuery.data} />
              ) : null}

              {categoriaActions.subcategoriaDrawerMode === 'create' ||
              categoriaActions.subcategoriaDrawerMode === 'edit' ? (
                <SubcategoriaForm
                  categorias={categoriaActions.categoriaOptionsQuery.data?.data || []}
                  formError={categoriaActions.formError}
                  formState={categoriaActions.subcategoriaFormState}
                  isPending={categoriaActions.saveSubcategoriaMutation.isPending}
                  onCancel={categoriaActions.closeSubcategoriaDrawer}
                  onChange={categoriaActions.setSubcategoriaFormState}
                  onSubmit={categoriaActions.submitSubcategoriaForm}
                />
              ) : null}

              {categoriaActions.selectedSubcategoriaId &&
              categoriaActions.subcategoriaDrawerMode !== 'create' ? (
                <div className="drawer-actions secondary-actions">
                  {categoriaActions.selectedSubcategoriaQuery.data?.ativo ? (
                    <button
                      className="ghost-button"
                      disabled={categoriaActions.deleteSubcategoriaMutation.isPending}
                      onClick={() =>
                        categoriaActions.deleteSubcategoriaMutation.mutate(
                          categoriaActions.selectedSubcategoriaId as number,
                        )
                      }
                      type="button"
                    >
                      Inativar subcategoria
                    </button>
                  ) : null}

                  <button
                    className="ghost-button"
                    onClick={categoriaActions.closeSubcategoriaDrawer}
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
