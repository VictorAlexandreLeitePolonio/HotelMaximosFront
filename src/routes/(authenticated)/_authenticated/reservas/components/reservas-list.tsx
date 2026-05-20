import { flexRender, type Table } from '@tanstack/react-table'
import type { ReservaListItem, ReservaStatus } from '@/lib/api-contracts'
import { reservaStatusOptions } from '@/routes/(authenticated)/_authenticated/reservas/schemas/reservas.schemas'

type ReservasListProps = {
  applyFilters: () => void
  currentPage: number
  draftDataFim: string
  draftDataInicio: string
  draftSearch: string
  draftStatus: 'Todas' | ReservaStatus
  errorMessage: string | null
  feedbackMessage: string | null
  isLoading: boolean
  onCreateReserva: () => void
  onDraftDataFimChange: (value: string) => void
  onDraftDataInicioChange: (value: string) => void
  onDraftSearchChange: (value: string) => void
  onDraftStatusChange: (value: 'Todas' | ReservaStatus) => void
  onNextPage: () => void
  onPreviousPage: () => void
  table: Table<ReservaListItem>
  totalPages: number
}

export function ReservasList({
  applyFilters,
  currentPage,
  draftDataFim,
  draftDataInicio,
  draftSearch,
  draftStatus,
  errorMessage,
  feedbackMessage,
  isLoading,
  onCreateReserva,
  onDraftDataFimChange,
  onDraftDataInicioChange,
  onDraftSearchChange,
  onDraftStatusChange,
  onNextPage,
  onPreviousPage,
  table,
  totalPages,
}: ReservasListProps) {
  return (
    <>
      <section className="page-toolbar">
        <div className="toolbar-copy">
          <strong>Operacao de reservas futuras</strong>
          <p>
            A tela principal da sprint 4 consome o contrato real de `/api/reservas` para
            listar, visualizar e criar reservas com snapshot de valores.
          </p>
        </div>

        <button className="primary-button" onClick={onCreateReserva} type="button">
          Nova reserva
        </button>
      </section>

      {feedbackMessage ? <p className="form-success">{feedbackMessage}</p> : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <section className="table-card">
        <section className="page-toolbar">
          <div className="toolbar-filters">
            <label className="field inline-field">
              <span>Busca</span>
              <input
                onChange={(event) => onDraftSearchChange(event.target.value)}
                placeholder="Flat, hospede ou CPF"
                value={draftSearch}
              />
            </label>

            <label className="field inline-field">
              <span>Status</span>
              <select
                onChange={(event) =>
                  onDraftStatusChange(event.target.value as 'Todas' | ReservaStatus)
                }
                value={draftStatus}
              >
                <option value="Todas">Todas</option>
                {reservaStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="field inline-field">
              <span>Data inicial</span>
              <input
                onChange={(event) => onDraftDataInicioChange(event.target.value)}
                type="date"
                value={draftDataInicio}
              />
            </label>

            <label className="field inline-field">
              <span>Data final</span>
              <input
                onChange={(event) => onDraftDataFimChange(event.target.value)}
                type="date"
                value={draftDataFim}
              />
            </label>

            <button className="ghost-button" onClick={applyFilters} type="button">
              Aplicar filtros
            </button>
          </div>
        </section>

        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>Carregando reservas...</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={7}>Nenhuma reserva encontrada para os filtros aplicados.</td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

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
