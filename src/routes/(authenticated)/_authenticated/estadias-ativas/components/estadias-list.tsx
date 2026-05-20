import { flexRender, type Table } from '@tanstack/react-table'
import type { Estadia } from '@/lib/api-contracts'

type EstadiasListProps = {
  applyFilters: () => void
  currentPage: number
  draftSearch: string
  errorMessage: string | null
  feedbackMessage: string | null
  isLoading: boolean
  onDraftSearchChange: (value: string) => void
  onNextPage: () => void
  onPreviousPage: () => void
  table: Table<Estadia>
  totalPages: number
}

export function EstadiasList({
  applyFilters,
  currentPage,
  draftSearch,
  errorMessage,
  feedbackMessage,
  isLoading,
  onDraftSearchChange,
  onNextPage,
  onPreviousPage,
  table,
  totalPages,
}: EstadiasListProps) {
  return (
    <>
      <section className="page-toolbar">
        <div className="toolbar-copy">
          <strong>Ocupacao ativa em operacao</strong>
          <p>
            A sprint 05 usa <code>/api/estadias/ativas</code> para listar ocupacoes ativas e
            abrir acoes de transferencia e renovacao sem misturar com reservas futuras.
          </p>
        </div>
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
                <td colSpan={7}>Carregando estadias ativas...</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={7}>Nenhuma estadia ativa encontrada para os filtros aplicados.</td>
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
