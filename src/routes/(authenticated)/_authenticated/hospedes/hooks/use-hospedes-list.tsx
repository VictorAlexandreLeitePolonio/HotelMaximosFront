import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { SetStateAction } from 'react'
import type { HospedeListItem, HospedesQuery } from '@/lib/api-contracts'
import { listHospedes } from '@/lib/http'
import { defaultHospedesFilters } from '@/routes/(authenticated)/_authenticated/hospedes/schemas/hospedes.schemas'

const columnHelper = createColumnHelper<HospedeListItem>()

type UseHospedesListOptions = {
  onViewHospede: (hospede: HospedeListItem) => void
  onEditHospede: (hospede: HospedeListItem) => void
}

export function useHospedesList({
  onViewHospede,
  onEditHospede,
}: UseHospedesListOptions) {
  const [filters, setFilters] = useState<HospedesQuery>(defaultHospedesFilters)
  const [draftSearch, setDraftSearch] = useState('')
  const [draftCpf, setDraftCpf] = useState('')
  const [draftAtivo, setDraftAtivo] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos')

  const hospedesQuery = useQuery({
    queryKey: ['hospedes', filters],
    queryFn: () => listHospedes(filters),
    placeholderData: keepPreviousData,
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('nomeCompleto', {
        header: () =>
          renderSortableHeader('Nome completo', 'nomeCompleto', filters, setFilters),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('cpf', {
        header: () => renderSortableHeader('CPF', 'cpf', filters, setFilters),
        cell: (info) => formatCpf(info.getValue()),
      }),
      columnHelper.accessor('telefone', {
        header: 'Telefone',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('email', {
        header: () => renderSortableHeader('Email', 'email', filters, setFilters),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('acompanhantesCount', {
        header: 'Acompanhantes',
        cell: (info) => String(info.getValue()),
      }),
      columnHelper.accessor('ativo', {
        header: 'Status',
        cell: (info) => (info.getValue() ? 'Ativo' : 'Inativo'),
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
              onClick={() => onViewHospede(row.original)}
              type="button"
            >
              Ver
            </button>
            <button
              className="ghost-button compact-button"
              onClick={() => onEditHospede(row.original)}
              type="button"
            >
              Editar
            </button>
          </div>
        ),
      }),
    ],
    [filters, onEditHospede, onViewHospede],
  )

  const table = useReactTable({
    data: hospedesQuery.data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function applyFilters() {
    setFilters((current) => ({
      ...current,
      page: 1,
      search: draftSearch.trim() || undefined,
      cpf: draftCpf.trim() || undefined,
      ativo:
        draftAtivo === 'Todos'
          ? undefined
          : draftAtivo === 'Ativos',
    }))
  }

  return {
    applyFilters,
    draftAtivo,
    draftCpf,
    draftSearch,
    filters,
    hospedesQuery,
    setDraftAtivo,
    setDraftCpf,
    setDraftSearch,
    setFilters,
    table,
  }
}

function renderSortableHeader(
  label: string,
  sortField: NonNullable<HospedesQuery['sortField']>,
  filters: HospedesQuery,
  setFilters: (value: SetStateAction<HospedesQuery>) => void,
) {
  const isActive = filters.sortField === sortField
  const nextOrder = isActive && filters.sortOrder === 'asc' ? 'desc' : 'asc'

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
      {isActive ? <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span> : null}
    </button>
  )
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.length !== 11) {
    return value
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
