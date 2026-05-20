import type { CheckInDoDiaItem } from '@/lib/api-contracts'

type CheckInDoDiaListProps = {
  applyFilters: () => void
  atrasados: CheckInDoDiaItem[]
  currentPage: number
  draftReferenceDate: string
  errorMessage: string | null
  feedbackMessage: string | null
  hoje: CheckInDoDiaItem[]
  isLoading: boolean
  onDirectCheckIn: () => void
  onDraftReferenceDateChange: (value: string) => void
  onNextPage: () => void
  onPreviousPage: () => void
  onReservationCheckIn: (reserva: CheckInDoDiaItem) => void
  totalPages: number
}

export function CheckInDoDiaList({
  applyFilters,
  atrasados,
  currentPage,
  draftReferenceDate,
  errorMessage,
  feedbackMessage,
  hoje,
  isLoading,
  onDirectCheckIn,
  onDraftReferenceDateChange,
  onNextPage,
  onPreviousPage,
  onReservationCheckIn,
  totalPages,
}: CheckInDoDiaListProps) {
  return (
    <>
      <section className="page-toolbar">
        <div className="toolbar-copy">
          <strong>Fila operacional de check-in</strong>
          <p>
            A sprint 05 usa o contrato real de <code>/api/estadias/check-in-do-dia</code> para
            separar reservas do dia e atrasadas sem misturar com a tela de reservas futuras.
          </p>
        </div>

        <button className="primary-button" onClick={onDirectCheckIn} type="button">
          Check-in direto
        </button>
      </section>

      {feedbackMessage ? <p className="form-success">{feedbackMessage}</p> : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <section className="table-card">
        <section className="page-toolbar">
          <div className="toolbar-filters">
            <label className="field inline-field">
              <span>Data de referencia</span>
              <input
                onChange={(event) => onDraftReferenceDateChange(event.target.value)}
                type="date"
                value={draftReferenceDate}
              />
            </label>

            <button className="ghost-button" onClick={applyFilters} type="button">
              Atualizar fila
            </button>
          </div>
        </section>

        <div className="form-grid">
          <CheckInGroupSection
            emptyMessage="Nenhuma reserva atrasada nesta pagina."
            isLoading={isLoading}
            items={atrasados}
            title="Atrasados"
            tone="danger"
            onReservationCheckIn={onReservationCheckIn}
          />

          <CheckInGroupSection
            emptyMessage="Nenhuma reserva prevista para o dia informado nesta pagina."
            isLoading={isLoading}
            items={hoje}
            title="Hoje"
            tone="info"
            onReservationCheckIn={onReservationCheckIn}
          />
        </div>

        <footer className="table-footer">
          <span>
            Pagina {currentPage} de {totalPages}
          </span>

          <div className="table-pagination">
            <button
              className="ghost-button compact-button"
              disabled={currentPage <= 1}
              onClick={onPreviousPage}
              type="button"
            >
              Anterior
            </button>

            <button
              className="ghost-button compact-button"
              disabled={currentPage >= totalPages}
              onClick={onNextPage}
              type="button"
            >
              Proxima
            </button>
          </div>
        </footer>
      </section>
    </>
  )
}

function CheckInGroupSection({
  emptyMessage,
  isLoading,
  items,
  title,
  tone,
  onReservationCheckIn,
}: {
  emptyMessage: string
  isLoading: boolean
  items: CheckInDoDiaItem[]
  title: string
  tone: 'danger' | 'info'
  onReservationCheckIn: (reserva: CheckInDoDiaItem) => void
}) {
  return (
    <section className="table-card">
      <div className="table-card-header">
        <div>
          <span className="status-pill" data-tone={tone}>
            {title}
          </span>
          <p>{title === 'Atrasados' ? 'Prioridade operacional imediata.' : 'Reservas previstas para o dia.'}</p>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Periodo reservado</th>
            <th>Flat</th>
            <th>Responsavel</th>
            <th>Hospedes</th>
            <th>Total contratado</th>
            <th>Acoes</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6}>Carregando fila de check-in...</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={6}>{emptyMessage}</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{`${formatDate(item.dataInicio)} - ${formatDate(item.dataFim)}`}</td>
                <td>{item.flat.numero}</td>
                <td>
                  <strong>{item.hospedeResponsavel.nomeCompleto}</strong>
                  <div className="muted-copy">{formatCpf(item.hospedeResponsavel.cpf)}</div>
                </td>
                <td>{item.quantidadeHospedes} pessoa(s)</td>
                <td>{formatCurrency(item.valorTotalContratado)}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="ghost-button compact-button"
                      onClick={() => onReservationCheckIn(item)}
                      type="button"
                    >
                      Realizar check-in
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
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
  }).format(new Date(value))
}

function formatCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
