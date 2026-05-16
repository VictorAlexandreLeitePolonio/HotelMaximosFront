import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import type { SetStateAction } from 'react'
import type {
  CategoriaListItem,
  CategoriaQuery,
  SubcategoriaListItem,
  SubcategoriasQuery,
} from '@/lib/api-contracts'
import { listCategorias, listSubcategorias } from '@/lib/http'
import {
  defaultCategoriasFilters,
  defaultSubcategoriasFilters,
} from '@/routes/(authenticated)/_authenticated/categorias/schemas/categorias.schemas'

const categoriaColumnHelper = createColumnHelper<CategoriaListItem>()
const subcategoriaColumnHelper = createColumnHelper<SubcategoriaListItem>()

type UseCategoriasListOptions = {
  onEditCategoria: (categoria: CategoriaListItem) => void
  onViewCategoria: (categoria: CategoriaListItem) => void
  onEditSubcategoria: (subcategoria: SubcategoriaListItem) => void
  onViewSubcategoria: (subcategoria: SubcategoriaListItem) => void
}

export function useCategoriasList({
  onEditCategoria,
  onViewCategoria,
  onEditSubcategoria,
  onViewSubcategoria,
}: UseCategoriasListOptions) {
  const [categoriaFilters, setCategoriaFilters] = useState<CategoriaQuery>(
    defaultCategoriasFilters,
  )
  const [subcategoriaFilters, setSubcategoriaFilters] = useState<SubcategoriasQuery>(
    defaultSubcategoriasFilters,
  )
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null)
  const [draftCategoriaSearch, setDraftCategoriaSearch] = useState('')
  const [draftCategoriaAtivo, setDraftCategoriaAtivo] = useState<
    'Todos' | 'Ativas' | 'Inativas'
  >('Todos')
  const [draftSubcategoriaSearch, setDraftSubcategoriaSearch] = useState('')
  const [draftSubcategoriaAtivo, setDraftSubcategoriaAtivo] = useState<
    'Todos' | 'Ativas' | 'Inativas'
  >('Todos')

  const categoriasQuery = useQuery({
    queryKey: ['categorias', categoriaFilters],
    queryFn: () => listCategorias(categoriaFilters),
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    const categorias = categoriasQuery.data?.data || []

    if (categorias.length === 0) {
      if (selectedCategoriaId !== null) {
        setSelectedCategoriaId(null)
      }
      return
    }

    const categoryStillExists = categorias.some((categoria) => categoria.id === selectedCategoriaId)

    if (!categoryStillExists) {
      setSelectedCategoriaId(categorias[0]?.id || null)
    }
  }, [categoriasQuery.data, selectedCategoriaId])

  const subcategoriasQuery = useQuery({
    queryKey: ['subcategorias', selectedCategoriaId, subcategoriaFilters],
    queryFn: () =>
      listSubcategorias({
        ...subcategoriaFilters,
        categoriaId: selectedCategoriaId || undefined,
      }),
    enabled: selectedCategoriaId !== null,
    placeholderData: keepPreviousData,
  })

  const categoriasColumns = useMemo(
    () => [
      categoriaColumnHelper.accessor('nome', {
        header: () =>
          renderCategoriaSortableHeader('Nome', 'nome', categoriaFilters, setCategoriaFilters),
        cell: (info) => info.getValue(),
      }),
      categoriaColumnHelper.accessor('subcategoriasCount', {
        header: 'Subcategorias',
        cell: (info) => String(info.getValue()),
      }),
      categoriaColumnHelper.accessor('ativo', {
        header: () =>
          renderCategoriaSortableHeader('Status', 'ativo', categoriaFilters, setCategoriaFilters),
        cell: (info) => (info.getValue() ? 'Ativa' : 'Inativa'),
      }),
      categoriaColumnHelper.accessor('atualizadoEm', {
        header: () =>
          renderCategoriaSortableHeader(
            'Atualizado em',
            'atualizadoEm',
            categoriaFilters,
            setCategoriaFilters,
          ),
        cell: (info) => formatDateTime(info.getValue()),
      }),
      categoriaColumnHelper.display({
        id: 'actions',
        header: 'Acoes',
        cell: ({ row }) => (
          <div className="table-actions">
            <button
              className="ghost-button compact-button"
              onClick={() => setSelectedCategoriaId(row.original.id)}
              type="button"
            >
              Selecionar
            </button>
            <button
              className="ghost-button compact-button"
              onClick={() => onViewCategoria(row.original)}
              type="button"
            >
              Ver
            </button>
            <button
              className="ghost-button compact-button"
              onClick={() => onEditCategoria(row.original)}
              type="button"
            >
              Editar
            </button>
          </div>
        ),
      }),
    ],
    [categoriaFilters, onEditCategoria, onViewCategoria],
  )

  const subcategoriasColumns = useMemo(
    () => [
      subcategoriaColumnHelper.accessor('nome', {
        header: () =>
          renderSubcategoriaSortableHeader(
            'Nome',
            'nome',
            subcategoriaFilters,
            setSubcategoriaFilters,
          ),
        cell: (info) => info.getValue(),
      }),
      subcategoriaColumnHelper.accessor('precoBase', {
        header: () =>
          renderSubcategoriaSortableHeader(
            'Preco base',
            'precoBase',
            subcategoriaFilters,
            setSubcategoriaFilters,
          ),
        cell: (info) => formatCurrency(info.getValue()),
      }),
      subcategoriaColumnHelper.accessor('capacidadeMaxima', {
        header: () =>
          renderSubcategoriaSortableHeader(
            'Capacidade',
            'capacidadeMaxima',
            subcategoriaFilters,
            setSubcategoriaFilters,
          ),
        cell: (info) => `${info.getValue()} hospedes`,
      }),
      subcategoriaColumnHelper.accessor('ativo', {
        header: 'Status',
        cell: (info) => (info.getValue() ? 'Ativa' : 'Inativa'),
      }),
      subcategoriaColumnHelper.display({
        id: 'actions',
        header: 'Acoes',
        cell: ({ row }) => (
          <div className="table-actions">
            <button
              className="ghost-button compact-button"
              onClick={() => onViewSubcategoria(row.original)}
              type="button"
            >
              Ver
            </button>
            <button
              className="ghost-button compact-button"
              onClick={() => onEditSubcategoria(row.original)}
              type="button"
            >
              Editar
            </button>
          </div>
        ),
      }),
    ],
    [onEditSubcategoria, onViewSubcategoria, subcategoriaFilters],
  )

  const categoriasTable = useReactTable({
    data: categoriasQuery.data?.data || [],
    columns: categoriasColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const subcategoriasTable = useReactTable({
    data: subcategoriasQuery.data?.data || [],
    columns: subcategoriasColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedCategoria =
    categoriasQuery.data?.data.find((categoria) => categoria.id === selectedCategoriaId) || null

  function applyCategoriasFilters() {
    setCategoriaFilters((current) => ({
      ...current,
      page: 1,
      search: draftCategoriaSearch.trim() || undefined,
      ativo:
        draftCategoriaAtivo === 'Todos'
          ? undefined
          : draftCategoriaAtivo === 'Ativas',
    }))
  }

  function applySubcategoriasFilters() {
    setSubcategoriaFilters((current) => ({
      ...current,
      page: 1,
      search: draftSubcategoriaSearch.trim() || undefined,
      ativo:
        draftSubcategoriaAtivo === 'Todos'
          ? undefined
          : draftSubcategoriaAtivo === 'Ativas',
    }))
  }

  return {
    applyCategoriasFilters,
    applySubcategoriasFilters,
    categoriasQuery,
    categoriasTable,
    categoriaFilters,
    draftCategoriaAtivo,
    draftCategoriaSearch,
    draftSubcategoriaAtivo,
    draftSubcategoriaSearch,
    selectedCategoria,
    selectedCategoriaId,
    setCategoriaFilters,
    setDraftCategoriaAtivo,
    setDraftCategoriaSearch,
    setDraftSubcategoriaAtivo,
    setDraftSubcategoriaSearch,
    setSelectedCategoriaId,
    setSubcategoriaFilters,
    subcategoriaFilters,
    subcategoriasQuery,
    subcategoriasTable,
  }
}

function renderCategoriaSortableHeader(
  label: string,
  sortField: NonNullable<CategoriaQuery['sortField']>,
  filters: CategoriaQuery,
  setFilters: (value: SetStateAction<CategoriaQuery>) => void,
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

function renderSubcategoriaSortableHeader(
  label: string,
  sortField: NonNullable<SubcategoriasQuery['sortField']>,
  filters: SubcategoriasQuery,
  setFilters: (value: SetStateAction<SubcategoriasQuery>) => void,
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
