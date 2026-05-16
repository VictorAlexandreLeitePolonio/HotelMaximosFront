import { flexRender, type Table } from '@tanstack/react-table'
import type { CategoriaListItem, SubcategoriaListItem } from '@/lib/api-contracts'

type CategoriasListProps = {
  applyCategoriasFilters: () => void
  applySubcategoriasFilters: () => void
  categoriaCurrentPage: number
  categoriaTotalPages: number
  categoriasTable: Table<CategoriaListItem>
  draftCategoriaAtivo: 'Todos' | 'Ativas' | 'Inativas'
  draftCategoriaSearch: string
  draftSubcategoriaAtivo: 'Todos' | 'Ativas' | 'Inativas'
  draftSubcategoriaSearch: string
  errorMessage: string | null
  feedbackMessage: string | null
  isCategoriasLoading: boolean
  isSubcategoriasLoading: boolean
  onCreateCategoria: () => void
  onCreateSubcategoria: () => void
  onDraftCategoriaAtivoChange: (value: 'Todos' | 'Ativas' | 'Inativas') => void
  onDraftCategoriaSearchChange: (value: string) => void
  onDraftSubcategoriaAtivoChange: (value: 'Todos' | 'Ativas' | 'Inativas') => void
  onDraftSubcategoriaSearchChange: (value: string) => void
  onNextCategoriaPage: () => void
  onNextSubcategoriaPage: () => void
  onPreviousCategoriaPage: () => void
  onPreviousSubcategoriaPage: () => void
  selectedCategoriaNome: string | null
  subcategoriaCurrentPage: number
  subcategoriaTotalPages: number
  subcategoriasTable: Table<SubcategoriaListItem>
}

export function CategoriasList({
  applyCategoriasFilters,
  applySubcategoriasFilters,
  categoriaCurrentPage,
  categoriaTotalPages,
  categoriasTable,
  draftCategoriaAtivo,
  draftCategoriaSearch,
  draftSubcategoriaAtivo,
  draftSubcategoriaSearch,
  errorMessage,
  feedbackMessage,
  isCategoriasLoading,
  isSubcategoriasLoading,
  onCreateCategoria,
  onCreateSubcategoria,
  onDraftCategoriaAtivoChange,
  onDraftCategoriaSearchChange,
  onDraftSubcategoriaAtivoChange,
  onDraftSubcategoriaSearchChange,
  onNextCategoriaPage,
  onNextSubcategoriaPage,
  onPreviousCategoriaPage,
  onPreviousSubcategoriaPage,
  selectedCategoriaNome,
  subcategoriaCurrentPage,
  subcategoriaTotalPages,
  subcategoriasTable,
}: CategoriasListProps) {
  return (
    <div className="form-grid">
      <section className="page-toolbar">
        <div className="toolbar-copy">
          <strong>Base estrutural da hospedagem</strong>
          <p>
            Cadastre categorias, distribua subcategorias com capacidade e preco base, e mantenha os flats vinculados ao contrato correto.
          </p>
        </div>

        <button className="primary-button" onClick={onCreateCategoria} type="button">
          Nova categoria
        </button>
      </section>

      {feedbackMessage ? <p className="form-success">{feedbackMessage}</p> : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <section className="table-card">
        <div className="table-card-header">
          <div>
            <strong>Categorias</strong>
            <p>Selecione uma categoria para trabalhar as subcategorias do mesmo agrupamento.</p>
          </div>
          {selectedCategoriaNome ? (
            <span className="selection-chip">Selecionada: {selectedCategoriaNome}</span>
          ) : null}
        </div>

        <section className="page-toolbar">
          <div className="toolbar-filters">
            <label className="field inline-field">
              <span>Busca</span>
              <input
                onChange={(event) => onDraftCategoriaSearchChange(event.target.value)}
                placeholder="Nome da categoria"
                value={draftCategoriaSearch}
              />
            </label>

            <label className="field inline-field">
              <span>Status</span>
              <select
                onChange={(event) =>
                  onDraftCategoriaAtivoChange(
                    event.target.value as 'Todos' | 'Ativas' | 'Inativas',
                  )
                }
                value={draftCategoriaAtivo}
              >
                <option value="Todos">Todas</option>
                <option value="Ativas">Ativas</option>
                <option value="Inativas">Inativas</option>
              </select>
            </label>

            <button className="ghost-button" onClick={applyCategoriasFilters} type="button">
              Aplicar filtros
            </button>
          </div>
        </section>

        <DataTable
          colSpan={5}
          emptyMessage="Nenhuma categoria encontrada."
          isLoading={isCategoriasLoading}
          loadingMessage="Carregando categorias..."
          table={categoriasTable}
        />

        <Pagination
          currentPage={categoriaCurrentPage}
          onNext={onNextCategoriaPage}
          onPrevious={onPreviousCategoriaPage}
          totalPages={categoriaTotalPages}
        />
      </section>

      <section className="table-card">
        <div className="table-card-header">
          <div>
            <strong>Subcategorias</strong>
            <p>
              {selectedCategoriaNome
                ? `Gerencie preco base e capacidade maxima de ${selectedCategoriaNome}.`
                : 'Selecione uma categoria acima para abrir as subcategorias relacionadas.'}
            </p>
          </div>

          <button
            className="primary-button"
            disabled={!selectedCategoriaNome}
            onClick={onCreateSubcategoria}
            type="button"
          >
            Nova subcategoria
          </button>
        </div>

        <section className="page-toolbar">
          <div className="toolbar-filters">
            <label className="field inline-field">
              <span>Busca</span>
              <input
                onChange={(event) => onDraftSubcategoriaSearchChange(event.target.value)}
                placeholder="Nome da subcategoria"
                value={draftSubcategoriaSearch}
              />
            </label>

            <label className="field inline-field">
              <span>Status</span>
              <select
                onChange={(event) =>
                  onDraftSubcategoriaAtivoChange(
                    event.target.value as 'Todos' | 'Ativas' | 'Inativas',
                  )
                }
                value={draftSubcategoriaAtivo}
              >
                <option value="Todos">Todas</option>
                <option value="Ativas">Ativas</option>
                <option value="Inativas">Inativas</option>
              </select>
            </label>

            <button
              className="ghost-button"
              disabled={!selectedCategoriaNome}
              onClick={applySubcategoriasFilters}
              type="button"
            >
              Aplicar filtros
            </button>
          </div>
        </section>

        {selectedCategoriaNome ? (
          <>
            <DataTable
              colSpan={5}
              emptyMessage="Nenhuma subcategoria encontrada para esta categoria."
              isLoading={isSubcategoriasLoading}
              loadingMessage="Carregando subcategorias..."
              table={subcategoriasTable}
            />

            <Pagination
              currentPage={subcategoriaCurrentPage}
              onNext={onNextSubcategoriaPage}
              onPrevious={onPreviousSubcategoriaPage}
              totalPages={subcategoriaTotalPages}
            />
          </>
        ) : (
          <p className="helper-copy">Nenhuma categoria selecionada no momento.</p>
        )}
      </section>
    </div>
  )
}

function DataTable<T>({
  colSpan,
  emptyMessage,
  isLoading,
  loadingMessage,
  table,
}: {
  colSpan: number
  emptyMessage: string
  isLoading: boolean
  loadingMessage: string
  table: Table<T>
}) {
  return (
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
            <td colSpan={colSpan}>{loadingMessage}</td>
          </tr>
        ) : table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={colSpan}>{emptyMessage}</td>
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
  )
}

function Pagination({
  currentPage,
  onNext,
  onPrevious,
  totalPages,
}: {
  currentPage: number
  onNext: () => void
  onPrevious: () => void
  totalPages: number
}) {
  return (
    <footer className="table-footer">
      <span>
        Pagina {currentPage} de {totalPages}
      </span>

      <div className="table-pagination">
        <button
          className="ghost-button compact-button"
          disabled={currentPage <= 1}
          onClick={onPrevious}
          type="button"
        >
          Anterior
        </button>

        <button
          className="ghost-button compact-button"
          disabled={currentPage >= totalPages}
          onClick={onNext}
          type="button"
        >
          Proxima
        </button>
      </div>
    </footer>
  )
}
