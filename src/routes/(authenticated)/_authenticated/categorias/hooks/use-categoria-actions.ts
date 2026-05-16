import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { CategoriaListItem, SubcategoriaListItem } from '@/lib/api-contracts'
import { ApiError } from '@/lib/api-core'
import {
  createCategoria,
  createSubcategoria,
  deleteCategoria,
  deleteSubcategoria,
  getCategoria,
  getSubcategoria,
  listCategorias,
  updateCategoria,
  updateSubcategoria,
} from '@/lib/http'
import {
  categoriaFormSchema,
  defaultCategoriaFormState,
  defaultSubcategoriaFormState,
  mapCategoriaToFormState,
  mapSubcategoriaToFormState,
  normalizeCategoriaCreatePayload,
  normalizeCategoriaUpdatePayload,
  normalizeSubcategoriaCreatePayload,
  normalizeSubcategoriaUpdatePayload,
  subcategoriaFormSchema,
  type CategoriaFormState,
  type DrawerMode,
  type SubcategoriaFormState,
} from '@/routes/(authenticated)/_authenticated/categorias/schemas/categorias.schemas'

export function useCategoriaActions() {
  const queryClient = useQueryClient()
  const [categoriaDrawerMode, setCategoriaDrawerMode] = useState<DrawerMode | null>(null)
  const [subcategoriaDrawerMode, setSubcategoriaDrawerMode] = useState<DrawerMode | null>(null)
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null)
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | null>(null)
  const [categoriaFormState, setCategoriaFormState] = useState<CategoriaFormState>(
    defaultCategoriaFormState,
  )
  const [subcategoriaFormState, setSubcategoriaFormState] = useState<SubcategoriaFormState>(
    defaultSubcategoriaFormState,
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const categoriaOptionsQuery = useQuery({
    queryKey: ['categorias', 'options'],
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

  const selectedCategoriaQuery = useQuery({
    queryKey: ['categorias', 'detail', selectedCategoriaId],
    queryFn: () => getCategoria(selectedCategoriaId as number),
    enabled: selectedCategoriaId !== null && categoriaDrawerMode !== 'create',
  })

  const selectedSubcategoriaQuery = useQuery({
    queryKey: ['subcategorias', 'detail', selectedSubcategoriaId],
    queryFn: () => getSubcategoria(selectedSubcategoriaId as number),
    enabled: selectedSubcategoriaId !== null && subcategoriaDrawerMode !== 'create',
  })

  useEffect(() => {
    if (!selectedCategoriaQuery.data || categoriaDrawerMode === 'create') {
      return
    }

    setCategoriaFormState(mapCategoriaToFormState(selectedCategoriaQuery.data))
  }, [categoriaDrawerMode, selectedCategoriaQuery.data])

  useEffect(() => {
    if (!selectedSubcategoriaQuery.data || subcategoriaDrawerMode === 'create') {
      return
    }

    setSubcategoriaFormState(mapSubcategoriaToFormState(selectedSubcategoriaQuery.data))
  }, [selectedSubcategoriaQuery.data, subcategoriaDrawerMode])

  async function invalidateQueries() {
    await queryClient.invalidateQueries({ queryKey: ['categorias'] })
    await queryClient.invalidateQueries({ queryKey: ['subcategorias'] })
    await queryClient.invalidateQueries({ queryKey: ['flats'] })
  }

  const saveCategoriaMutation = useMutation({
    mutationFn: async () => {
      const parsed = categoriaFormSchema.safeParse(categoriaFormState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      if (categoriaDrawerMode === 'create') {
        return createCategoria(normalizeCategoriaCreatePayload(parsed.data))
      }

      if (!selectedCategoriaId) {
        throw new ApiError('Categoria nao selecionada.', 400)
      }

      return updateCategoria(selectedCategoriaId, normalizeCategoriaUpdatePayload(parsed.data))
    },
    onSuccess: async (categoria) => {
      await invalidateQueries()
      setFeedbackMessage(
        categoriaDrawerMode === 'create'
          ? `Categoria ${categoria.nome} criada com sucesso.`
          : `Categoria ${categoria.nome} atualizada com sucesso.`,
      )
      closeCategoriaDrawer()
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : 'Nao foi possivel salvar a categoria.')
    },
  })

  const deleteCategoriaMutation = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: async () => {
      await invalidateQueries()
      setFeedbackMessage('Categoria inativada com sucesso.')
      closeCategoriaDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError ? error.message : 'Nao foi possivel inativar a categoria.',
      )
    },
  })

  const saveSubcategoriaMutation = useMutation({
    mutationFn: async () => {
      const parsed = subcategoriaFormSchema.safeParse(subcategoriaFormState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      if (subcategoriaDrawerMode === 'create') {
        return createSubcategoria(normalizeSubcategoriaCreatePayload(parsed.data))
      }

      if (!selectedSubcategoriaId) {
        throw new ApiError('Subcategoria nao selecionada.', 400)
      }

      return updateSubcategoria(
        selectedSubcategoriaId,
        normalizeSubcategoriaUpdatePayload(parsed.data),
      )
    },
    onSuccess: async (subcategoria) => {
      await invalidateQueries()
      setFeedbackMessage(
        subcategoriaDrawerMode === 'create'
          ? `Subcategoria ${subcategoria.nome} criada com sucesso.`
          : `Subcategoria ${subcategoria.nome} atualizada com sucesso.`,
      )
      closeSubcategoriaDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError ? error.message : 'Nao foi possivel salvar a subcategoria.',
      )
    },
  })

  const deleteSubcategoriaMutation = useMutation({
    mutationFn: (id: number) => deleteSubcategoria(id),
    onSuccess: async () => {
      await invalidateQueries()
      setFeedbackMessage('Subcategoria inativada com sucesso.')
      closeSubcategoriaDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError ? error.message : 'Nao foi possivel inativar a subcategoria.',
      )
    },
  })

  function openCreateCategoria() {
    setCategoriaDrawerMode('create')
    setSubcategoriaDrawerMode(null)
    setSelectedCategoriaId(null)
    setCategoriaFormState(defaultCategoriaFormState)
    setFormError(null)
    setFeedbackMessage(null)
  }

  function openViewCategoria(categoria: CategoriaListItem) {
    openCategoriaDrawer('view', categoria.id)
  }

  function openEditCategoria(categoria: CategoriaListItem) {
    openCategoriaDrawer('edit', categoria.id)
  }

  function openCategoriaDrawer(mode: Exclude<DrawerMode, 'create'>, categoriaId: number) {
    setCategoriaDrawerMode(mode)
    setSubcategoriaDrawerMode(null)
    setSelectedCategoriaId(categoriaId)
    setCategoriaFormState(defaultCategoriaFormState)
    setFormError(null)
    setFeedbackMessage(null)
  }

  function closeCategoriaDrawer() {
    setCategoriaDrawerMode(null)
    setSelectedCategoriaId(null)
    setCategoriaFormState(defaultCategoriaFormState)
    setFormError(null)
  }

  function submitCategoriaForm() {
    setFormError(null)
    saveCategoriaMutation.mutate()
  }

  function openCreateSubcategoria(categoriaId?: number | null) {
    setSubcategoriaDrawerMode('create')
    setCategoriaDrawerMode(null)
    setSelectedSubcategoriaId(null)
    setSubcategoriaFormState({
      ...defaultSubcategoriaFormState,
      categoriaId: categoriaId ? String(categoriaId) : '',
    })
    setFormError(null)
    setFeedbackMessage(null)
  }

  function openViewSubcategoria(subcategoria: SubcategoriaListItem) {
    openSubcategoriaDrawer('view', subcategoria.id)
  }

  function openEditSubcategoria(subcategoria: SubcategoriaListItem) {
    openSubcategoriaDrawer('edit', subcategoria.id)
  }

  function openSubcategoriaDrawer(mode: Exclude<DrawerMode, 'create'>, subcategoriaId: number) {
    setSubcategoriaDrawerMode(mode)
    setCategoriaDrawerMode(null)
    setSelectedSubcategoriaId(subcategoriaId)
    setSubcategoriaFormState(defaultSubcategoriaFormState)
    setFormError(null)
    setFeedbackMessage(null)
  }

  function closeSubcategoriaDrawer() {
    setSubcategoriaDrawerMode(null)
    setSelectedSubcategoriaId(null)
    setSubcategoriaFormState(defaultSubcategoriaFormState)
    setFormError(null)
  }

  function submitSubcategoriaForm() {
    setFormError(null)
    saveSubcategoriaMutation.mutate()
  }

  return {
    categoriaDrawerMode,
    categoriaFormState,
    categoriaOptionsQuery,
    closeCategoriaDrawer,
    closeSubcategoriaDrawer,
    deleteCategoriaMutation,
    deleteSubcategoriaMutation,
    feedbackMessage,
    formError,
    openCreateCategoria,
    openCreateSubcategoria,
    openEditCategoria,
    openEditSubcategoria,
    openViewCategoria,
    openViewSubcategoria,
    saveCategoriaMutation,
    saveSubcategoriaMutation,
    selectedCategoriaId,
    selectedCategoriaQuery,
    selectedSubcategoriaId,
    selectedSubcategoriaQuery,
    setCategoriaFormState,
    setSubcategoriaFormState,
    submitCategoriaForm,
    submitSubcategoriaForm,
    subcategoriaDrawerMode,
    subcategoriaFormState,
  }
}
