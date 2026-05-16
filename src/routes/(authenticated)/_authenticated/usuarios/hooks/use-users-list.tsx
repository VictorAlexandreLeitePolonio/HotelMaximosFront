import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { SetStateAction } from 'react'
import type { UserListItem, UserProfile, UsersQuery } from '@/lib/api-contracts'
import { listUsers } from '@/lib/http'
import { defaultUsersFilters } from '@/routes/(authenticated)/_authenticated/usuarios/schemas/users.schemas'

const columnHelper = createColumnHelper<UserListItem>()

type UseUsersListOptions = {
  onViewUser: (user: UserListItem) => void
  onEditUser: (user: UserListItem) => void
}

export function useUsersList({ onViewUser, onEditUser }: UseUsersListOptions) {
  const [filters, setFilters] = useState<UsersQuery>(defaultUsersFilters)
  const [draftSearch, setDraftSearch] = useState('')
  const [draftPerfil, setDraftPerfil] = useState<'Todos' | UserProfile>('Todos')
  const [draftAtivo, setDraftAtivo] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos')

  const usersQuery = useQuery({
    queryKey: ['users', filters],
    queryFn: () => listUsers(filters),
    placeholderData: keepPreviousData,
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('login', {
        header: () => renderSortableHeader('Login', 'login', filters, setFilters),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('nomeCompleto', {
        header: () =>
          renderSortableHeader('Nome completo', 'nomeCompleto', filters, setFilters),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('perfil', {
        header: () => renderSortableHeader('Perfil', 'perfil', filters, setFilters),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('ativo', {
        header: () => renderSortableHeader('Status', 'ativo', filters, setFilters),
        cell: (info) => (info.getValue() ? 'Ativo' : 'Inativo'),
      }),
      columnHelper.accessor('deveAlterarSenha', {
        header: 'Troca de senha',
        cell: (info) => (info.getValue() ? 'Obrigatoria' : 'Ok'),
      }),
      columnHelper.accessor('atualizadoEm', {
        header: () =>
          renderSortableHeader('Atualizado em', 'atualizadoEm', filters, setFilters),
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acoes',
        cell: ({ row }) => (
          <div className="table-actions">
            <button
              className="ghost-button compact-button"
              onClick={() => onViewUser(row.original)}
              type="button"
            >
              Ver
            </button>
            <button
              className="ghost-button compact-button"
              onClick={() => onEditUser(row.original)}
              type="button"
            >
              Editar
            </button>
          </div>
        ),
      }),
    ],
    [filters, onEditUser, onViewUser],
  )

  const table = useReactTable({
    data: usersQuery.data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function applyFilters() {
    setFilters((current) => ({
      ...current,
      page: 1,
      search: draftSearch.trim() || undefined,
      perfil: draftPerfil === 'Todos' ? undefined : draftPerfil,
      ativo:
        draftAtivo === 'Todos'
          ? undefined
          : draftAtivo === 'Ativos',
    }))
  }

  return {
    applyFilters,
    draftAtivo,
    draftPerfil,
    draftSearch,
    filters,
    setDraftAtivo,
    setDraftPerfil,
    setDraftSearch,
    setFilters,
    table,
    usersQuery,
  }
}

function renderSortableHeader(
  label: string,
  sortField: NonNullable<UsersQuery['sortField']>,
  filters: UsersQuery,
  setFilters: (value: SetStateAction<UsersQuery>) => void,
) {
  const isActive = filters.sortField === sortField
  const nextOrder =
    isActive && filters.sortOrder === 'asc' ? 'desc' : 'asc'

  return (
    <button
      className={isActive ? 'sort-button sort-button-active' : 'sort-button'}
      onClick={() =>
        setFilters((current) => ({
          ...current,
          page: 1,
          sortField,
          sortOrder: nextOrder,
        }))
      }
      type="button"
    >
      {label}
      {isActive ? (
        <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
      ) : null}
    </button>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
