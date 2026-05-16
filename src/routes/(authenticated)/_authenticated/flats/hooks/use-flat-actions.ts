import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { FlatListItem } from '@/lib/api-contracts'
import { ApiError } from '@/lib/api-core'
import {
  createFlat,
  deleteFlat,
  getFlat,
  listCategorias,
  listSubcategorias,
  updateFlat,
} from '@/lib/http'
import {
  defaultFlatFormState,
  flatFormSchema,
  mapFlatToFormState,
  normalizeFlatCreatePayload,
  normalizeFlatUpdatePayload,
  type DrawerMode,
  type FlatFormState,
} from '@/routes/(authenticated)/_authenticated/flats/schemas/flats.schemas'

export function useFlatActions() {
  const queryClient = useQueryClient()
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null)
  const [selectedFlatId, setSelectedFlatId] = useState<number | null>(null)
  const [formState, setFormState] = useState<FlatFormState>(defaultFlatFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const categoriasOptionsQuery = useQuery({
    queryKey: ['categorias', 'options', 'flat-form'],
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
    queryKey: ['subcategorias', 'options', 'flat-form', formState.categoriaId],
    queryFn: () =>
      listSubcategorias({
        page: 1,
        pageSize: 100,
        categoriaId: formState.categoriaId ? Number(formState.categoriaId) : undefined,
        sortField: 'nome',
        sortOrder: 'asc',
        ativo: true,
      }),
    enabled: Boolean(formState.categoriaId),
    placeholderData: keepPreviousData,
  })

  const selectedFlatQuery = useQuery({
    queryKey: ['flats', 'detail', selectedFlatId],
    queryFn: () => getFlat(selectedFlatId as number),
    enabled: selectedFlatId !== null && drawerMode !== 'create',
  })

  useEffect(() => {
    if (!selectedFlatQuery.data || drawerMode === 'create') {
      return
    }

    setFormState(mapFlatToFormState(selectedFlatQuery.data))
  }, [drawerMode, selectedFlatQuery.data])

  async function invalidateQueries() {
    await queryClient.invalidateQueries({ queryKey: ['flats'] })
    await queryClient.invalidateQueries({ queryKey: ['subcategorias'] })
  }

  const saveFlatMutation = useMutation({
    mutationFn: async () => {
      const parsed = flatFormSchema.safeParse(formState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      if (drawerMode === 'create') {
        return createFlat(normalizeFlatCreatePayload(parsed.data))
      }

      if (!selectedFlatId) {
        throw new ApiError('Flat nao selecionado.', 400)
      }

      return updateFlat(selectedFlatId, normalizeFlatUpdatePayload(parsed.data))
    },
    onSuccess: async (flat) => {
      await invalidateQueries()
      setFeedbackMessage(
        drawerMode === 'create'
          ? `Flat ${flat.numero} criado com sucesso.`
          : `Flat ${flat.numero} atualizado com sucesso.`,
      )
      closeDrawer()
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : 'Nao foi possivel salvar o flat.')
    },
  })

  const deleteFlatMutation = useMutation({
    mutationFn: (id: number) => deleteFlat(id),
    onSuccess: async () => {
      await invalidateQueries()
      setFeedbackMessage('Flat inativado com sucesso.')
      closeDrawer()
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : 'Nao foi possivel inativar o flat.')
    },
  })

  function openCreate() {
    setDrawerMode('create')
    setSelectedFlatId(null)
    setFormState(defaultFlatFormState)
    setFormError(null)
    setFeedbackMessage(null)
  }

  function openView(flat: FlatListItem) {
    openWithFlat('view', flat)
  }

  function openEdit(flat: FlatListItem) {
    openWithFlat('edit', flat)
  }

  function openWithFlat(mode: Exclude<DrawerMode, 'create'>, flat: FlatListItem) {
    setDrawerMode(mode)
    setSelectedFlatId(flat.id)
    setFormState({
      numero: flat.numero,
      descricao: flat.descricao || '',
      categoriaId: String(flat.categoriaId),
      subcategoriaId: String(flat.subcategoriaId),
      statusOperacional: flat.statusOperacional,
    })
    setFormError(null)
    setFeedbackMessage(null)
  }

  function closeDrawer() {
    setDrawerMode(null)
    setSelectedFlatId(null)
    setFormState(defaultFlatFormState)
    setFormError(null)
  }

  function submitForm() {
    setFormError(null)
    saveFlatMutation.mutate()
  }

  function handleFormStateChange(nextState: FlatFormState) {
    if (nextState.categoriaId !== formState.categoriaId) {
      setFormState({
        ...nextState,
        subcategoriaId: '',
      })
      return
    }

    setFormState(nextState)
  }

  return {
    categoriasOptionsQuery,
    closeDrawer,
    deleteFlatMutation,
    drawerMode,
    feedbackMessage,
    formError,
    formState,
    handleFormStateChange,
    openCreate,
    openEdit,
    openView,
    saveFlatMutation,
    selectedFlatId,
    selectedFlatQuery,
    submitForm,
    subcategoriasOptionsQuery,
  }
}
