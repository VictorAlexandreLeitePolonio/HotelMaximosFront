import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { ApiError } from '@/lib/api-core'
import { DisponibilidadeGrid } from '@/routes/(authenticated)/_authenticated/reservas/components/disponibilidade-grid'
import { ReservaForm } from '@/routes/(authenticated)/_authenticated/reservas/components/reserva-form'
import { ReservasList } from '@/routes/(authenticated)/_authenticated/reservas/components/reservas-list'
import { ReservaView } from '@/routes/(authenticated)/_authenticated/reservas/components/reserva-view'
import { useReservaActions } from '@/routes/(authenticated)/_authenticated/reservas/hooks/use-reserva-actions'
import { useReservasList } from '@/routes/(authenticated)/_authenticated/reservas/hooks/use-reservas-list'

export const Route = createFileRoute('/(authenticated)/_authenticated/reservas/')({
  component: ReservasPage,
})

function ReservasPage() {
  const reservaActions = useReservaActions()
  const reservasList = useReservasList({
    onViewReserva: reservaActions.openView,
  })

  const selectedReservaErrorMessage = useMemo(() => {
    if (reservaActions.selectedReservaQuery.error instanceof ApiError) {
      return reservaActions.selectedReservaQuery.error.message
    }

    return reservaActions.formError
  }, [reservaActions.formError, reservaActions.selectedReservaQuery.error])

  const reservasErrorMessage = useMemo(() => {
    if (reservasList.reservasQuery.error instanceof ApiError) {
      return reservasList.reservasQuery.error.message
    }

    return null
  }, [reservasList.reservasQuery.error])

  const disponibilidadeErrorMessage = useMemo(() => {
    if (reservasList.disponibilidadeQuery.error instanceof ApiError) {
      return reservasList.disponibilidadeQuery.error.message
    }

    return null
  }, [reservasList.disponibilidadeQuery.error])

  return (
    <AppShell
      title="Reservas e disponibilidade"
      description="Sprint 4 do front integrada aos contratos reais de `/api/reservas` e `/api/reservas/disponibilidade`, cobrindo criacao por formulario, grade visual e painel lateral contextual no padrao definido em spec e tasks."
    >
      <ReservasList
        applyFilters={reservasList.applyFilters}
        currentPage={reservasList.currentPage}
        draftDataFim={reservasList.draftDataFim}
        draftDataInicio={reservasList.draftDataInicio}
        draftSearch={reservasList.draftSearch}
        draftStatus={reservasList.draftStatus}
        errorMessage={reservasErrorMessage}
        feedbackMessage={reservaActions.feedbackMessage}
        isLoading={reservasList.reservasQuery.isLoading}
        onCreateReserva={() => reservaActions.openCreate(reservasList.availabilityContext)}
        onDraftDataFimChange={reservasList.setDraftDataFim}
        onDraftDataInicioChange={reservasList.setDraftDataInicio}
        onDraftSearchChange={reservasList.setDraftSearch}
        onDraftStatusChange={reservasList.setDraftStatus}
        onNextPage={() =>
          reservasList.setFilters((current) => ({
            ...current,
            page: current.page + 1,
          }))
        }
        onPreviousPage={() =>
          reservasList.setFilters((current) => ({
            ...current,
            page: Math.max(1, current.page - 1),
          }))
        }
        table={reservasList.table}
        totalPages={reservasList.totalPages}
      />

      <DisponibilidadeGrid
        applyFilters={reservasList.applyAvailabilityFilters}
        categoriasOptions={reservasList.categoriasOptions}
        currentPage={reservasList.availabilityCurrentPage}
        data={reservasList.disponibilidadeFlats}
        draftCategoriaId={reservasList.availabilityDrafts.categoriaId}
        draftDataFim={reservasList.availabilityDrafts.dataFim}
        draftDataInicio={reservasList.availabilityDrafts.dataInicio}
        draftSubcategoriaId={reservasList.availabilityDrafts.subcategoriaId}
        errorMessage={disponibilidadeErrorMessage}
        isLoading={reservasList.disponibilidadeQuery.isLoading}
        onDraftCategoriaChange={reservasList.handleDraftAvailabilityCategoriaChange}
        onDraftDataFimChange={reservasList.setDraftAvailabilityDataFim}
        onDraftDataInicioChange={reservasList.setDraftAvailabilityDataInicio}
        onDraftSubcategoriaChange={reservasList.setDraftAvailabilitySubcategoriaId}
        onFlatClick={(flat) => reservaActions.openAvailability(flat, reservasList.availabilityContext)}
        onNextPage={() =>
          reservasList.setAvailabilityFilters((current) => ({
            ...current,
            page: current.page + 1,
          }))
        }
        onPreviousPage={() =>
          reservasList.setAvailabilityFilters((current) => ({
            ...current,
            page: Math.max(1, current.page - 1),
          }))
        }
        subcategoriasOptions={reservasList.subcategoriasOptions}
        totalPages={reservasList.totalAvailabilityPages}
      />

      {reservaActions.drawerMode ? (
        <section className="drawer-backdrop" onClick={reservaActions.closeDrawer}>
          <article className="drawer-card" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <span className="page-kicker">
                {reservaActions.drawerMode === 'create'
                  ? 'Criacao'
                  : reservaActions.drawerMode === 'view'
                    ? 'Visualizacao'
                    : 'Disponibilidade'}
              </span>
              <h2>Reserva</h2>
              <p>
                O mesmo drawer atende a issue `#16` com o formulario principal e a issue `#17`
                com o painel contextual da grade, seguindo o PRD da sprint 4 sem romper o
                contrato real do backend atual.
              </p>
            </div>

            {reservaActions.drawerMode === 'view' &&
            reservaActions.selectedReservaQuery.isLoading ? (
              <p>Carregando reserva...</p>
            ) : null}

            {selectedReservaErrorMessage ? (
              <p className="form-error">{selectedReservaErrorMessage}</p>
            ) : null}

            {reservaActions.drawerMode === 'view' &&
            reservaActions.selectedReservaQuery.data ? (
              <ReservaView reserva={reservaActions.selectedReservaQuery.data} />
            ) : null}

            {reservaActions.drawerMode === 'create' ? (
              <ReservaForm
                acompanhantesOptions={reservaActions.acompanhantesOptions}
                categoriasOptions={reservaActions.categoriasOptions}
                disponibilidadeOptions={reservaActions.disponibilidadeOptions}
                formError={reservaActions.formError}
                formState={reservaActions.formState}
                hospedesOptions={reservaActions.hospedesOptions}
                isPending={reservaActions.saveReservaMutation.isPending}
                onCancel={reservaActions.closeDrawer}
                onChange={reservaActions.handleFormStateChange}
                onSubmit={reservaActions.submitForm}
                resumoFinanceiro={reservaActions.resumoFinanceiro}
                selectedFlat={reservaActions.selectedFlat}
                subcategoriasOptions={reservaActions.subcategoriasOptions}
              />
            ) : null}

            {reservaActions.drawerMode === 'availability' && reservaActions.contextualFlat ? (
              <div className="form-grid">
                <div className="detail-grid">
                  <AvailabilityDetail label="Flat" value={reservaActions.contextualFlat.numero} />
                  <AvailabilityDetail
                    label="Subcategoria"
                    value={reservaActions.contextualFlat.subcategoria.nome}
                  />
                  <AvailabilityDetail
                    label="Status no periodo"
                    value={reservaActions.contextualFlat.statusDisponibilidade}
                  />
                  <AvailabilityDetail
                    label="Capacidade"
                    value={`${reservaActions.contextualFlat.subcategoria.capacidadeMaxima} hospedes`}
                  />
                  <AvailabilityDetail
                    label="Preco base"
                    value={formatCurrency(reservaActions.contextualFlat.subcategoria.precoBase)}
                  />
                  <AvailabilityDetail
                    label="Periodo consultado"
                    value={`${formatDate(reservaActions.formState.dataInicio)} - ${formatDate(reservaActions.formState.dataFim)}`}
                  />
                </div>

                <div className="detail-item">
                  <span>Contexto operacional</span>
                  <strong>
                    {reservaActions.contextualFlat.disponivel
                      ? 'O flat pode receber reserva nesse intervalo.'
                      : 'O backend marcou esse flat como indisponivel para o intervalo consultado.'}
                  </strong>
                </div>

                <div className="drawer-actions">
                  {reservaActions.contextualFlat.disponivel ? (
                    <button
                      className="primary-button"
                      onClick={reservaActions.startCreateFromAvailability}
                      type="button"
                    >
                      Criar reserva neste flat
                    </button>
                  ) : null}

                  <button
                    className="ghost-button"
                    onClick={reservaActions.closeDrawer}
                    type="button"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : null}

            {reservaActions.drawerMode === 'view' ? (
              <div className="drawer-actions secondary-actions">
                <button className="ghost-button" onClick={reservaActions.closeDrawer} type="button">
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

function AvailabilityDetail({ label, value }: { label: string; value: string }) {
  return (
    <article className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(`${value}T12:00:00.000Z`))
}
