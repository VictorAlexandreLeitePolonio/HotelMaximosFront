import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { ApiError } from '@/lib/api-core'
import { HospedeCreateForm } from '@/routes/(authenticated)/_authenticated/hospedes/components/hospede-create-form'
import { HospedeEditForm } from '@/routes/(authenticated)/_authenticated/hospedes/components/hospede-edit-form'
import { HospedeView } from '@/routes/(authenticated)/_authenticated/hospedes/components/hospede-view'
import { HospedesList } from '@/routes/(authenticated)/_authenticated/hospedes/components/hospedes-list'
import { useHospedeActions } from '@/routes/(authenticated)/_authenticated/hospedes/hooks/use-hospede-actions'
import { useHospedesList } from '@/routes/(authenticated)/_authenticated/hospedes/hooks/use-hospedes-list'

export const Route = createFileRoute('/(authenticated)/_authenticated/hospedes/')({
  component: HospedesPage,
})

function HospedesPage() {
  const hospedeActions = useHospedeActions()
  const hospedesList = useHospedesList({
    onEditHospede: hospedeActions.openEdit,
    onViewHospede: hospedeActions.openView,
  })

  const selectedHospedeErrorMessage = useMemo(() => {
    if (hospedeActions.selectedHospedeQuery.error instanceof ApiError) {
      return hospedeActions.selectedHospedeQuery.error.message
    }

    return hospedeActions.formError
  }, [hospedeActions.formError, hospedeActions.selectedHospedeQuery.error])

  const hospedesErrorMessage = useMemo(() => {
    if (hospedesList.hospedesQuery.error instanceof ApiError) {
      return hospedesList.hospedesQuery.error.message
    }

    return null
  }, [hospedesList.hospedesQuery.error])

  return (
    <AppShell
      title="Hospedes"
      description="Sprint 2 do front integrada ao modulo real `/api/hospedes`, com cadastro do responsavel, acompanhantes simplificados, filtros, paginacao e inativacao."
    >
      <HospedesList
        applyFilters={hospedesList.applyFilters}
        currentPage={hospedesList.hospedesQuery.data?.meta.page || hospedesList.filters.page}
        draftAtivo={hospedesList.draftAtivo}
        draftCpf={hospedesList.draftCpf}
        draftSearch={hospedesList.draftSearch}
        errorMessage={hospedesErrorMessage}
        feedbackMessage={hospedeActions.feedbackMessage}
        isLoading={hospedesList.hospedesQuery.isLoading}
        onCreateHospede={hospedeActions.openCreate}
        onDraftAtivoChange={hospedesList.setDraftAtivo}
        onDraftCpfChange={hospedesList.setDraftCpf}
        onDraftSearchChange={hospedesList.setDraftSearch}
        onNextPage={() =>
          hospedesList.setFilters((current) => ({
            ...current,
            page: current.page + 1,
          }))
        }
        onPreviousPage={() =>
          hospedesList.setFilters((current) => ({
            ...current,
            page: Math.max(1, current.page - 1),
          }))
        }
        table={hospedesList.table}
        totalPages={hospedesList.hospedesQuery.data?.meta.totalPages || 1}
      />

      {hospedeActions.drawerMode ? (
        <section className="drawer-backdrop" onClick={hospedeActions.closeDrawer}>
          <article
            className="drawer-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-header">
              <span className="page-kicker">
                {hospedeActions.drawerMode === 'create'
                  ? 'Criacao'
                  : hospedeActions.drawerMode === 'edit'
                    ? 'Edicao'
                    : 'Visualizacao'}
              </span>
              <h2>Hospede responsavel</h2>
              <p>
                O drawer consome o detalhe real do modulo e salva acompanhantes no mesmo payload aninhado aceito pelo backend.
              </p>
            </div>

            {hospedeActions.selectedHospedeQuery.isLoading &&
            hospedeActions.drawerMode !== 'create' ? (
              <p>Carregando hospede...</p>
            ) : null}

            {selectedHospedeErrorMessage ? (
              <p className="form-error">{selectedHospedeErrorMessage}</p>
            ) : null}

            {hospedeActions.drawerMode === 'view' &&
            hospedeActions.selectedHospedeQuery.data ? (
              <HospedeView hospede={hospedeActions.selectedHospedeQuery.data} />
            ) : null}

            {hospedeActions.drawerMode === 'create' ? (
              <HospedeCreateForm
                formError={hospedeActions.formError}
                formState={hospedeActions.formState}
                isPending={hospedeActions.saveHospedeMutation.isPending}
                onCancel={hospedeActions.closeDrawer}
                onChange={hospedeActions.setFormState}
                onSubmit={hospedeActions.submitForm}
              />
            ) : null}

            {hospedeActions.drawerMode === 'edit' ? (
              <HospedeEditForm
                formError={hospedeActions.formError}
                formState={hospedeActions.formState}
                isPending={hospedeActions.saveHospedeMutation.isPending}
                onCancel={hospedeActions.closeDrawer}
                onChange={hospedeActions.setFormState}
                onSubmit={hospedeActions.submitForm}
              />
            ) : null}

            {hospedeActions.selectedHospedeId && hospedeActions.drawerMode !== 'create' ? (
              <div className="drawer-actions secondary-actions">
                {hospedeActions.selectedHospedeQuery.data?.ativo ? (
                  <button
                    className="ghost-button"
                    disabled={hospedeActions.deleteHospedeMutation.isPending}
                    onClick={() =>
                      hospedeActions.deleteHospedeMutation.mutate(
                        hospedeActions.selectedHospedeId as number,
                      )
                    }
                    type="button"
                  >
                    Inativar cadastro
                  </button>
                ) : null}

                <button
                  className="ghost-button"
                  onClick={hospedeActions.closeDrawer}
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
  )
}
