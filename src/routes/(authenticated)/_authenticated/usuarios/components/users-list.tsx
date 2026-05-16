import { flexRender, type Table } from '@tanstack/react-table'
import type { UserListItem, UserProfile } from '@/lib/api-contracts'

type UsersListProps = {
  applyFilters: () => void
  currentPage: number
  draftAtivo: 'Todos' | 'Ativos' | 'Inativos'
  draftPerfil: 'Todos' | UserProfile
  draftSearch: string
  errorMessage: string | null
  feedbackMessage: string | null
  isLoading: boolean
  onCreateUser: () => void
  onDraftAtivoChange: (value: 'Todos' | 'Ativos' | 'Inativos') => void
  onDraftPerfilChange: (value: 'Todos' | UserProfile) => void
  onDraftSearchChange: (value: string) => void
  onNextPage: () => void
  onPreviousPage: () => void
  table: Table<UserListItem>
  totalPages: number
}

export function UsersList({
  applyFilters,
  currentPage,
  draftAtivo,
  draftPerfil,
  draftSearch,
  errorMessage,
  feedbackMessage,
  isLoading,
  onCreateUser,
  onDraftAtivoChange,
  onDraftPerfilChange,
  onDraftSearchChange,
  onNextPage,
  onPreviousPage,
  table,
  totalPages,
}: UsersListProps) {
  return (
    <>
      <section className="page-toolbar">
        <div className="toolbar-filters">
          <label className="field inline-field">
            <span>Busca</span>
            <input
              onChange={(event) => onDraftSearchChange(event.target.value)}
              placeholder="Login, nome ou email"
              value={draftSearch}
            />
          </label>

          <label className="field inline-field">
            <span>Perfil</span>
            <select
              onChange={(event) =>
                onDraftPerfilChange(event.target.value as 'Todos' | UserProfile)
              }
              value={draftPerfil}
            >
              <option value="Todos">Todos</option>
              <option value="Admin">Admin</option>
              <option value="Recepcionista">Recepcionista</option>
            </select>
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

        <button className="primary-button" onClick={onCreateUser} type="button">
          Novo usuario
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
                <td colSpan={7}>Carregando usuarios...</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={7}>Nenhum usuario encontrado para os filtros aplicados.</td>
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
