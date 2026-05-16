import { flexRender, type Table } from '@tanstack/react-table'
import type { HospedeListItem } from '@/lib/api-contracts'

type HospedesListProps = {
  applyFilters: () => void
  currentPage: number
  draftAtivo: 'Todos' | 'Ativos' | 'Inativos'
  draftCpf: string
  draftSearch: string
  errorMessage: string | null
  feedbackMessage: string | null
  isLoading: boolean
  onCreateHospede: () => void
  onDraftAtivoChange: (value: 'Todos' | 'Ativos' | 'Inativos') => void
  onDraftCpfChange: (value: string) => void
  onDraftSearchChange: (value: string) => void
  onNextPage: () => void
  onPreviousPage: () => void
  table: Table<HospedeListItem>
  totalPages: number
}

export function HospedesList({
  applyFilters,
  currentPage,
  draftAtivo,
  draftCpf,
  draftSearch,
  errorMessage,
  feedbackMessage,
  isLoading,
  onCreateHospede,
  onDraftAtivoChange,
  onDraftCpfChange,
  onDraftSearchChange,
  onNextPage,
  onPreviousPage,
  table,
  totalPages,
}: HospedesListProps) {
  return (
    <>
      <section className="page-toolbar">
        <div className="toolbar-filters">
          <label className="field inline-field">
            <span>Busca</span>
            <input
              onChange={(event) => onDraftSearchChange(event.target.value)}
              placeholder="Nome, email, telefone ou CPF"
              value={draftSearch}
            />
          </label>

          <label className="field inline-field">
            <span>CPF exato</span>
            <input
              onChange={(event) => onDraftCpfChange(event.target.value)}
              placeholder="Somente digitos ou formatado"
              value={draftCpf}
            />
          </label>

          <label className="field inline-field">
            <span>Status</span>
            <select
              onChange={(event) =>
                onDraftAtivoChange(
                  event.target.value as 'Todos' | 'Ativos' | 'Inativos',
                )
              }
              value={draftAtivo}
            >
              <option value="Todos">Todos</option>
              <option value="Ativos">Ativos</option>
              <option value="Inativos">Inativos</option>
            </select>
          </label>

          <button className="ghost-button" onClick={applyFilters} type="button">
            Aplicar filtros
          </button>
        </div>

        <button className="primary-button" onClick={onCreateHospede} type="button">
          Novo hospede
        </button>
      </section>

      {feedbackMessage ? <p className="form-success">{feedbackMessage}</p> : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <section className="table-card">
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
                <td colSpan={8}>Carregando hospedes...</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={8}>Nenhum hospede encontrado para os filtros aplicados.</td>
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
