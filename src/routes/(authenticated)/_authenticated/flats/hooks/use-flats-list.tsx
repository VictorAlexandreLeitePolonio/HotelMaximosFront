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
  FlatListItem,
  FlatsQuery,
  FlatOperationalStatus,
  SubcategoriaListItem,
} from '@/lib/api-contracts'
import { listCategorias, listFlats, listSubcategorias } from '@/lib/http'
import {
  defaultFlatsFilters,
  flatOperationalStatuses,
} from '@/routes/(authenticated)/_authenticated/flats/schemas/flats.schemas'

const columnHelper = createColumnHelper<FlatListItem>()

type UseFlatsListOptions = {
  onEditFlat: (flat: FlatListItem) => void
  onViewFlat: (flat: FlatListItem) => void
}

export function useFlatsList({ onEditFlat, onViewFlat }: UseFlatsListOptions) {
  const [filters, setFilters] = useState<FlatsQuery>(defaultFlatsFilters)
  const [draftSearch, setDraftSearch] = useState('')
  const [draftCategoriaId, setDraftCategoriaId] = useState('')
  const [draftSubcategoriaId, setDraftSubcategoriaId] = useState('')
  const [draftStatusOperacional, setDraftStatusOperacional] = useState<
    'Todos' | FlatOperationalStatus
  >('Todos')
  const [draftAtivo, setDraftAtivo] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos')

  const flatsQuery = useQuery({
    queryKey: ['flats', filters],
    queryFn: () => listFlats(filters),
    placeholderData: keepPreviousData,
  })

  const categoriasOptionsQuery = useQuery({
    queryKey: ['categorias', 'options', 'flats'],
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
    queryKey: ['subcategorias', 'options', 'flats', draftCategoriaId],
    queryFn: () =>
      listSubcategorias({
        page: 1,
        pageSize: 100,
        categoriaId: draftCategoriaId ? Number(draftCategoriaId) : undefined,
        sortField: 'nome',
        sortOrder: 'asc',
        ativo: true,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('numero', {
        header: () => renderSortableHeader('Flat', 'numero', filters, setFilters),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('categoriaNome', {
        header: 'Categoria',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('subcategoriaNome', {
        header: 'Subcategoria',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('statusOperacional', {
        header: () =>
          renderSortableHeader('Status', 'statusOperacional', filters, setFilters),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('capacidadeMaxima', {
        header: 'Capacidade',
        cell: (info) => `${info.getValue()} hospedes`,
      }),
      columnHelper.display({
        id: 'valorBase',
        header: 'Preco base',
        cell: ({ row }) => formatCurrency(row.original.precoBase),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acoes',
        cell: ({ row }) => (
          <div className="table-actions">
            <button
              className="ghost-button compact-button"
              onClick={() => onViewFlat(row.original)}
              type="button"
            >
              Ver
            </button>
            <button
              className="ghost-button compact-button"
              onClick={() => onEditFlat(row.original)}
              type="button"
            >
              Editar
            </button>
          </div>
        ),
      }),
    ],
    [filters, onEditFlat, onViewFlat],
  )

  const table = useReactTable({
    data: flatsQuery.data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function applyFilters() {
    setFilters((current) => ({
      ...current,
      page: 1,
      search: draftSearch.trim() || undefined,
      categoriaId: draftCategoriaId ? Number(draftCategoriaId) : undefined,
      subcategoriaId: draftSubcategoriaId ? Number(draftSubcategoriaId) : undefined,
      statusOperacional:
        draftStatusOperacional === 'Todos' ? undefined : draftStatusOperacional,
      ativo:
        draftAtivo === 'Todos'
          ? undefined
          : draftAtivo === 'Ativos',
    }))
  }

  function handleDraftCategoriaChange(value: string) {
    setDraftCategoriaId(value)
    setDraftSubcategoriaId('')
  }

  return {
    applyFilters,
    categoriasOptions: (categoriasOptionsQuery.data?.data || []) as CategoriaListItem[],
    draftAtivo,
    draftCategoriaId,
    draftSearch,
    draftStatusOperacional,
    draftSubcategoriaId,
    filters,
    flatOperationalStatuses,
    flatsQuery,
    handleDraftCategoriaChange,
    setDraftAtivo,
    setDraftSearch,
    setDraftStatusOperacional,
    setDraftSubcategoriaId,
    setFilters,
    subcategoriasOptions: (subcategoriasOptionsQuery.data?.data || []) as SubcategoriaListItem[],
    table,
  }
}

function renderSortableHeader(
  label: string,
  sortField: NonNullable<FlatsQuery['sortField']>,
  filters: FlatsQuery,
  setFilters: (value: SetStateAction<FlatsQuery>) => void,
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
