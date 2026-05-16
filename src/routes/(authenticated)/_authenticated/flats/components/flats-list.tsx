import { flexRender, type Table } from '@tanstack/react-table'
import type {
  CategoriaListItem,
  FlatListItem,
  FlatOperationalStatus,
  SubcategoriaListItem,
} from '@/lib/api-contracts'

type FlatsListProps = {
  applyFilters: () => void
  categoriasOptions: CategoriaListItem[]
  currentPage: number
  draftAtivo: 'Todos' | 'Ativos' | 'Inativos'
  draftCategoriaId: string
  draftSearch: string
  draftStatusOperacional: 'Todos' | FlatOperationalStatus
  draftSubcategoriaId: string
  errorMessage: string | null
  feedbackMessage: string | null
  flatOperationalStatuses: FlatOperationalStatus[]
  isLoading: boolean
  onCreateFlat: () => void
  onDraftAtivoChange: (value: 'Todos' | 'Ativos' | 'Inativos') => void
  onDraftCategoriaChange: (value: string) => void
  onDraftSearchChange: (value: string) => void
  onDraftStatusChange: (value: 'Todos' | FlatOperationalStatus) => void
  onDraftSubcategoriaChange: (value: string) => void
  onNextPage: () => void
  onPreviousPage: () => void
  subcategoriasOptions: SubcategoriaListItem[]
  table: Table<FlatListItem>
  totalPages: number
}

export function FlatsList({
  applyFilters,
  categoriasOptions,
  currentPage,
  draftAtivo,
  draftCategoriaId,
  draftSearch,
  draftStatusOperacional,
  draftSubcategoriaId,
  errorMessage,
  feedbackMessage,
  flatOperationalStatuses,
  isLoading,
  onCreateFlat,
  onDraftAtivoChange,
  onDraftCategoriaChange,
  onDraftSearchChange,
  onDraftStatusChange,
  onDraftSubcategoriaChange,
  onNextPage,
  onPreviousPage,
  subcategoriasOptions,
  table,
  totalPages,
}: FlatsListProps) {
  return (
    <>
      <section className="page-toolbar">
        <div className="toolbar-copy">
          <strong>Mapa administrativo dos flats</strong>
          <p>
            Cadastre unidade, categoria, subcategoria, capacidade e status operacional base antes dos fluxos de reserva e estadia.
          </p>
        </div>

        <button className="primary-button" onClick={onCreateFlat} type="button">
          Novo flat
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
                placeholder="Numero do flat"
                value={draftSearch}
              />
            </label>

            <label className="field inline-field">
              <span>Categoria</span>
              <select
                onChange={(event) => onDraftCategoriaChange(event.target.value)}
                value={draftCategoriaId}
              >
                <option value="">Todas</option>
                {categoriasOptions.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="field inline-field">
              <span>Subcategoria</span>
              <select
                onChange={(event) => onDraftSubcategoriaChange(event.target.value)}
                value={draftSubcategoriaId}
              >
                <option value="">Todas</option>
                {subcategoriasOptions.map((subcategoria) => (
                  <option key={subcategoria.id} value={subcategoria.id}>
                    {subcategoria.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="field inline-field">
              <span>Status operacional</span>
              <select
                onChange={(event) =>
                  onDraftStatusChange(
                    event.target.value as 'Todos' | FlatOperationalStatus,
                  )
                }
                value={draftStatusOperacional}
              >
                <option value="Todos">Todos</option>
                {flatOperationalStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="field inline-field">
              <span>Status do cadastro</span>
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
                <td colSpan={7}>Carregando flats...</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={7}>Nenhum flat encontrado para os filtros aplicados.</td>
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
