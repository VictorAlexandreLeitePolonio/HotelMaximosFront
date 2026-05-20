import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { ApiError } from '@/lib/api-core'
import { CheckInDiretoForm } from '@/routes/(authenticated)/_authenticated/check-in/components/checkin-direto-form'
import { CheckInDoDiaList } from '@/routes/(authenticated)/_authenticated/check-in/components/checkin-do-dia-list'
import { CheckInReservaForm } from '@/routes/(authenticated)/_authenticated/check-in/components/checkin-reserva-form'
import { useCheckInActions } from '@/routes/(authenticated)/_authenticated/check-in/hooks/use-checkin-actions'
import { useCheckInList } from '@/routes/(authenticated)/_authenticated/check-in/hooks/use-checkin-list'

export const Route = createFileRoute('/(authenticated)/_authenticated/check-in/')({
  component: CheckInPage,
})

function CheckInPage() {
  const checkInActions = useCheckInActions()
  const checkInList = useCheckInList()

  const errorMessage = useMemo(() => {
    if (checkInList.checkInDoDiaQuery.error instanceof ApiError) {
      return checkInList.checkInDoDiaQuery.error.message
    }

    return null
  }, [checkInList.checkInDoDiaQuery.error])

  return (
    <AppShell
      title="Check-in do dia"
      description="Sprint 05 do front integrada aos contratos reais de check-in por reserva e check-in direto, separando reservas do dia e atrasadas em uma fila operacional unica."
    >
      <CheckInDoDiaList
        applyFilters={checkInList.applyFilters}
        atrasados={checkInList.groupedData.atrasado}
        currentPage={checkInList.currentPage}
        draftReferenceDate={checkInList.draftReferenceDate}
        errorMessage={errorMessage}
        feedbackMessage={checkInActions.feedbackMessage}
        hoje={checkInList.groupedData.hoje}
        isLoading={checkInList.checkInDoDiaQuery.isLoading}
        onDirectCheckIn={checkInActions.openDirectCheckIn}
        onDraftReferenceDateChange={checkInList.setDraftReferenceDate}
        onNextPage={() =>
          checkInList.setFilters((current) => ({
            ...current,
            page: current.page + 1,
          }))
        }
        onPreviousPage={() =>
          checkInList.setFilters((current) => ({
            ...current,
            page: Math.max(1, current.page - 1),
          }))
        }
        onReservationCheckIn={checkInActions.openReservationCheckIn}
        totalPages={checkInList.totalPages}
      />

      {checkInActions.drawerMode ? (
        <section className="drawer-backdrop" onClick={checkInActions.closeDrawer}>
          <article className="drawer-card" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <span className="page-kicker">
                {checkInActions.drawerMode === 'reservation' ? 'Reserva existente' : 'Check-in direto'}
              </span>
              <h2>
                {checkInActions.drawerMode === 'reservation'
                  ? 'Concluir check-in da reserva'
                  : 'Criar reserva e estadia na mesma operacao'}
              </h2>
              <p>
                O drawer usa o contrato real da sprint 05 sem abrir fluxo paralelo: ou liquida a
                reserva do dia, ou cria reserva e estadia em uma unica transacao.
              </p>
            </div>

            {checkInActions.drawerMode === 'reservation' &&
            checkInActions.selectedReserva &&
            checkInActions.reservaFormState ? (
              <CheckInReservaForm
                formError={checkInActions.formError}
                formState={checkInActions.reservaFormState}
                isPending={checkInActions.checkInReservaMutation.isPending}
                onCancel={checkInActions.closeDrawer}
                onChange={checkInActions.handleReservaFormChange}
                onSubmit={checkInActions.submitReservationCheckIn}
                reserva={checkInActions.selectedReserva}
                requiresProof={checkInActions.requiresReservaProof}
                totalEsperado={checkInActions.reservaTotalEsperado}
              />
            ) : null}

            {checkInActions.drawerMode === 'direct' ? (
              <CheckInDiretoForm
                acompanhantesOptions={checkInActions.acompanhantesOptions}
                availabilityHelperMessage={checkInActions.availabilityHelperMessage}
                disponibilidadeOptions={checkInActions.disponibilidadeDiretoOptions}
                formError={checkInActions.formError}
                formState={checkInActions.diretoFormState}
                hospedesOptions={checkInActions.hospedesOptions}
                isPending={checkInActions.checkInDiretoMutation.isPending}
                onCancel={checkInActions.closeDrawer}
                onChange={checkInActions.handleDiretoFormChange}
                onSubmit={checkInActions.submitDirectCheckIn}
                requiresProof={checkInActions.requiresDiretoProof}
                resumoFinanceiro={checkInActions.resumoDireto}
              />
            ) : null}
          </article>
        </section>
      ) : null}
    </AppShell>
  )
}
