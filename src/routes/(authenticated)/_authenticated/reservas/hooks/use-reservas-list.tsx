import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { SetStateAction } from 'react'
import type {
  CategoriaListItem,
  DisponibilidadeFlat,
  ReservaListItem,
  ReservasQuery,
  ReservaStatus,
  SubcategoriaListItem,
} from '@/lib/api-contracts'
import { listCategorias, listDisponibilidade, listReservas, listSubcategorias } from '@/lib/http'
import {
  defaultDisponibilidadeFilters,
  defaultReservasFilters,
  isDateRangeValid,
} from '@/routes/(authenticated)/_authenticated/reservas/schemas/reservas.schemas'

const columnHelper = createColumnHelper<ReservaListItem>()

type UseReservasListOptions = {
  onViewReserva: (reserva: ReservaListItem) => void
}

export function useReservasList({ onViewReserva }: UseReservasListOptions) {
  const [filters, setFilters] = useState<ReservasQuery>(defaultReservasFilters)
  const [draftSearch, setDraftSearch] = useState('')
  const [draftStatus, setDraftStatus] = useState<'Todas' | ReservaStatus>('Todas')
  const [draftDataInicio, setDraftDataInicio] = useState('')
  const [draftDataFim, setDraftDataFim] = useState('')
  const [availabilityFilters, setAvailabilityFilters] = useState(defaultDisponibilidadeFilters)
  const [draftAvailabilityDataInicio, setDraftAvailabilityDataInicio] = useState(
    defaultDisponibilidadeFilters.dataInicio,
  )
  const [draftAvailabilityDataFim, setDraftAvailabilityDataFim] = useState(
    defaultDisponibilidadeFilters.dataFim,
  )
  const [draftAvailabilityCategoriaId, setDraftAvailabilityCategoriaId] = useState('')
  const [draftAvailabilitySubcategoriaId, setDraftAvailabilitySubcategoriaId] = useState('')

  const reservasQuery = useQuery({
    queryKey: ['reservas', filters],
    queryFn: () => listReservas(filters),
    placeholderData: keepPreviousData,
  })

  const disponibilidadeQuery = useQuery({
    queryKey: ['reservas', 'disponibilidade', availabilityFilters],
    queryFn: () => listDisponibilidade(availabilityFilters),
    enabled: isDateRangeValid(availabilityFilters.dataInicio, availabilityFilters.dataFim),
    placeholderData: keepPreviousData,
  })

  const categoriasOptionsQuery = useQuery({
    queryKey: ['categorias', 'options', 'reservas'],
    queryFn: () =>
      listCategorias({
        page: 1,
        pageSize: 100,
        sortField: 'nome',
        sortOrder: 'asc',
        ativo: true,
      }),
    placeholderData: keepPreviousData,
  })

  const subcategoriasOptionsQuery = useQuery({
    queryKey: ['subcategorias', 'options', 'reservas', draftAvailabilityCategoriaId],
    queryFn: () =>
      listSubcategorias({
        page: 1,
        pageSize: 100,
        categoriaId: draftAvailabilityCategoriaId ? Number(draftAvailabilityCategoriaId) : undefined,
        sortField: 'nome',
        sortOrder: 'asc',
        ativo: true,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'periodo',
        header: () => renderSortableHeader('Periodo', 'dataInicio', filters, setFilters),
        cell: ({ row }) =>
          `${formatDate(row.original.dataInicio)} - ${formatDate(row.original.dataFim)}`,
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
          <span className="status-pill" data-tone={getReservaStatusTone(info.getValue())}>
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
              onClick={() => onViewReserva(row.original)}
              type="button"
            >
              Ver
            </button>
          </div>
        ),
      }),
    ],
    [filters, onViewReserva],
  )

  const table = useReactTable({
    data: reservasQuery.data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function applyFilters() {
    setFilters((current) => ({
      ...current,
      page: 1,
      search: draftSearch.trim() || undefined,
      status: draftStatus === 'Todas' ? undefined : draftStatus,
      dataInicio: draftDataInicio || undefined,
      dataFim: draftDataFim || undefined,
    }))
  }

  function applyAvailabilityFilters() {
    setAvailabilityFilters((current) => ({
      ...current,
      page: 1,
      dataInicio: draftAvailabilityDataInicio,
      dataFim: draftAvailabilityDataFim,
      categoriaId: draftAvailabilityCategoriaId ? Number(draftAvailabilityCategoriaId) : undefined,
      subcategoriaId: draftAvailabilitySubcategoriaId
        ? Number(draftAvailabilitySubcategoriaId)
        : undefined,
    }))
  }

  function handleDraftAvailabilityCategoriaChange(value: string) {
    setDraftAvailabilityCategoriaId(value)
    setDraftAvailabilitySubcategoriaId('')
  }

  return {
    applyAvailabilityFilters,
    applyFilters,
    availabilityContext: {
      dataInicio: draftAvailabilityDataInicio,
      dataFim: draftAvailabilityDataFim,
      categoriaId: draftAvailabilityCategoriaId,
      subcategoriaId: draftAvailabilitySubcategoriaId,
    },
    availabilityCurrentPage:
      disponibilidadeQuery.data?.meta.page || availabilityFilters.page,
    availabilityDrafts: {
      categoriaId: draftAvailabilityCategoriaId,
      dataFim: draftAvailabilityDataFim,
      dataInicio: draftAvailabilityDataInicio,
      subcategoriaId: draftAvailabilitySubcategoriaId,
    },
    categoriasOptions: (categoriasOptionsQuery.data?.data || []) as CategoriaListItem[],
    currentPage: reservasQuery.data?.meta.page || filters.page,
    disponibilidadeFlats: (disponibilidadeQuery.data?.data || []) as DisponibilidadeFlat[],
    disponibilidadeQuery,
    draftDataFim,
    draftDataInicio,
    draftSearch,
    draftStatus,
    filters,
    handleDraftAvailabilityCategoriaChange,
    reservasQuery,
    setAvailabilityFilters,
    setDraftAvailabilityCategoriaId,
    setDraftAvailabilityDataFim,
    setDraftAvailabilityDataInicio,
    setDraftAvailabilitySubcategoriaId,
    setDraftDataFim,
    setDraftDataInicio,
    setDraftSearch,
    setDraftStatus,
    setFilters,
    subcategoriasOptions: (subcategoriasOptionsQuery.data?.data || []) as SubcategoriaListItem[],
    table,
    totalAvailabilityPages: disponibilidadeQuery.data?.meta.totalPages || 1,
    totalPages: reservasQuery.data?.meta.totalPages || 1,
  }
}

function renderSortableHeader(
  label: string,
  sortField: NonNullable<ReservasQuery['sortField']>,
  filters: ReservasQuery,
  setFilters: (value: SetStateAction<ReservasQuery>) => void,
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

function getReservaStatusTone(status: ReservaStatus) {
  switch (status) {
    case 'Confirmada':
      return 'success'
    case 'Cancelada':
      return 'danger'
    case 'NoShow':
      return 'warning'
    default:
      return 'neutral'
  }
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
