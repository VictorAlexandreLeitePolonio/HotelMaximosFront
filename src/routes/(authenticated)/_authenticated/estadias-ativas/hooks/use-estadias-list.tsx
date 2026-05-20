import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { SetStateAction } from 'react'
import type { Estadia, EstadiasAtivasQuery } from '@/lib/api-contracts'
import { listEstadiasAtivas } from '@/lib/http'
import { defaultEstadiasAtivasFilters } from '@/routes/(authenticated)/_authenticated/estadias-ativas/schemas/estadias.schemas'

const columnHelper = createColumnHelper<Estadia>()

type UseEstadiasListOptions = {
  onRenewStay: (estadia: Estadia) => void
  onTransferFlat: (estadia: Estadia) => void
  onViewEstadia: (estadia: Estadia) => void
}

export function useEstadiasList({
  onRenewStay,
  onTransferFlat,
  onViewEstadia,
}: UseEstadiasListOptions) {
  const [filters, setFilters] = useState<EstadiasAtivasQuery>(defaultEstadiasAtivasFilters)
  const [draftSearch, setDraftSearch] = useState('')

  const estadiasQuery = useQuery({
    queryKey: ['estadias-ativas', filters],
    queryFn: () => listEstadiasAtivas(filters),
    placeholderData: keepPreviousData,
  })

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'periodo',
        header: () => renderSortableHeader('Periodo ativo', 'dataInicio', filters, setFilters),
        cell: ({ row }) =>
          `${formatDate(row.original.dataInicio)} - ${formatDate(row.original.dataFimPrevista)}`,
      }),
      columnHelper.accessor((row) => row.flat.numero, {
        id: 'flat',
        header: 'Flat',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.hospedeResponsavel.nomeCompleto, {
        id: 'responsavel',
        header: 'Hospede responsavel',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <span className="status-pill" data-tone={info.getValue() === 'Ativa' ? 'success' : 'neutral'}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('quantidadeHospedes', {
        header: 'Hospedes',
        cell: (info) => `${info.getValue()} pessoa(s)`,
      }),
      columnHelper.accessor('valorTotalContratado', {
        header: 'Total contratado',
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acoes',
        cell: ({ row }) => (
          <div className="table-actions">
            <button
              className="ghost-button compact-button"
              onClick={() => onViewEstadia(row.original)}
              type="button"
            >
              Ver
            </button>
            <button
              className="ghost-button compact-button"
              onClick={() => onTransferFlat(row.original)}
              type="button"
            >
              Trocar flat
            </button>
            <button
              className="ghost-button compact-button"
              onClick={() => onRenewStay(row.original)}
              type="button"
            >
              Renovar
            </button>
          </div>
        ),
      }),
    ],
    [filters, onRenewStay, onTransferFlat, onViewEstadia],
  )

  const table = useReactTable({
    data: estadiasQuery.data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function applyFilters() {
    setFilters((current) => ({
      ...current,
      page: 1,
      search: draftSearch.trim() || undefined,
    }))
  }

  return {
    applyFilters,
    currentPage: estadiasQuery.data?.meta.page || filters.page,
    draftSearch,
    estadiasQuery,
    filters,
    setDraftSearch,
    setFilters,
    table,
    totalPages: estadiasQuery.data?.meta.totalPages || 1,
  }
}

function renderSortableHeader(
  label: string,
  sortField: NonNullable<EstadiasAtivasQuery['sortField']>,
  filters: EstadiasAtivasQuery,
  setFilters: (value: SetStateAction<EstadiasAtivasQuery>) => void,
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
