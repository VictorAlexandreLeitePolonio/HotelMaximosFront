import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { ApiError } from '@/lib/api-core'
import { EstadiaView } from '@/routes/(authenticated)/_authenticated/estadias-ativas/components/estadia-view'
import { EstadiasList } from '@/routes/(authenticated)/_authenticated/estadias-ativas/components/estadias-list'
import { RenewStayForm } from '@/routes/(authenticated)/_authenticated/estadias-ativas/components/renew-stay-form'
import { TransferFlatForm } from '@/routes/(authenticated)/_authenticated/estadias-ativas/components/transfer-flat-form'
import { useEstadiaActions } from '@/routes/(authenticated)/_authenticated/estadias-ativas/hooks/use-estadia-actions'
import { useEstadiasList } from '@/routes/(authenticated)/_authenticated/estadias-ativas/hooks/use-estadias-list'

export const Route = createFileRoute('/(authenticated)/_authenticated/estadias-ativas/')({
  component: EstadiasAtivasPage,
})

function EstadiasAtivasPage() {
  const estadiaActions = useEstadiaActions()
  const estadiasList = useEstadiasList({
    onRenewStay: estadiaActions.openRenew,
    onTransferFlat: estadiaActions.openTransfer,
    onViewEstadia: estadiaActions.openView,
  })

  const errorMessage = useMemo(() => {
    if (estadiasList.estadiasQuery.error instanceof ApiError) {
      return estadiasList.estadiasQuery.error.message
    }

    return null
  }, [estadiasList.estadiasQuery.error])

  return (
    <AppShell
      title="Estadias ativas"
      description="Sprint 05 do front integrada ao contrato real de ocupacoes ativas, cobrindo visualizacao operacional, troca de flat e renovacao de periodo."
    >
      <EstadiasList
        applyFilters={estadiasList.applyFilters}
        currentPage={estadiasList.currentPage}
        draftSearch={estadiasList.draftSearch}
        errorMessage={errorMessage}
        feedbackMessage={estadiaActions.feedbackMessage}
        isLoading={estadiasList.estadiasQuery.isLoading}
        onDraftSearchChange={estadiasList.setDraftSearch}
        onNextPage={() =>
          estadiasList.setFilters((current) => ({
            ...current,
            page: current.page + 1,
          }))
        }
        onPreviousPage={() =>
          estadiasList.setFilters((current) => ({
            ...current,
            page: Math.max(1, current.page - 1),
          }))
        }
        table={estadiasList.table}
        totalPages={estadiasList.totalPages}
      />

      {estadiaActions.drawerMode ? (
        <section className="drawer-backdrop" onClick={estadiaActions.closeDrawer}>
          <article className="drawer-card" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <span className="page-kicker">
                {estadiaActions.drawerMode === 'view'
                  ? 'Visualizacao'
                  : estadiaActions.drawerMode === 'transfer'
                    ? 'Transferencia'
                    : 'Renovacao'}
              </span>
              <h2>Estadia ativa</h2>
              <p>
                O mesmo drawer concentra leitura operacional e acoes da sprint 05 sem sair da fila
                principal de ocupacao.
              </p>
            </div>

            {estadiaActions.drawerMode === 'view' && estadiaActions.selectedEstadia ? (
              <EstadiaView estadia={estadiaActions.selectedEstadia} />
            ) : null}

            {estadiaActions.drawerMode === 'transfer' && estadiaActions.selectedEstadia ? (
              <TransferFlatForm
                availabilityHelperMessage={estadiaActions.transferAvailabilityHelperMessage}
                currentFlatLabel={estadiaActions.selectedEstadia.flat.numero}
                formError={estadiaActions.formError}
                formState={estadiaActions.transferFormState}
                isPending={estadiaActions.transferFlatMutation.isPending}
                onCancel={estadiaActions.closeDrawer}
                onChange={estadiaActions.setTransferFormState}
                onSubmit={estadiaActions.submitTransfer}
                options={estadiaActions.transferFlatOptions}
              />
            ) : null}

            {estadiaActions.drawerMode === 'renew' &&
            estadiaActions.selectedEstadia &&
            estadiaActions.renewFormState ? (
              <RenewStayForm
                currentEndDateLabel={formatDate(estadiaActions.selectedEstadia.dataFimPrevista)}
                formError={estadiaActions.formError}
                formState={estadiaActions.renewFormState}
                isPending={estadiaActions.renewStayMutation.isPending}
                onCancel={estadiaActions.closeDrawer}
                onChange={estadiaActions.setRenewFormState}
                onSubmit={estadiaActions.submitRenew}
              />
            ) : null}

            {estadiaActions.drawerMode === 'view' ? (
              <div className="drawer-actions secondary-actions">
                <button className="ghost-button" onClick={estadiaActions.closeDrawer} type="button">
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value))
}
