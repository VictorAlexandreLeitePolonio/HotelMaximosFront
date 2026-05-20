import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type {
  CategoriaListItem,
  DisponibilidadeFlat,
  HospedeListItem,
  SubcategoriaListItem,
} from '@/lib/api-contracts'
import { ApiError } from '@/lib/api-core'
import {
  createReserva,
  getHospede,
  getReserva,
  listCategorias,
  listDisponibilidade,
  listHospedes,
  listSubcategorias,
} from '@/lib/http'
import {
  buildAvailabilityContext,
  defaultReservaFormState,
  isDateRangeValid,
  normalizeReservaCreatePayload,
  reservaFormSchema,
  type AvailabilityContext,
  type DrawerMode,
  type ReservaFormState,
} from '@/routes/(authenticated)/_authenticated/reservas/schemas/reservas.schemas'

export function useReservaActions() {
  const queryClient = useQueryClient()
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null)
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null)
  const [contextualFlat, setContextualFlat] = useState<DisponibilidadeFlat | null>(null)
  const [formState, setFormState] = useState<ReservaFormState>(defaultReservaFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const selectedReservaQuery = useQuery({
    queryKey: ['reservas', 'detail', selectedReservaId],
    queryFn: () => getReserva(selectedReservaId as number),
    enabled: selectedReservaId !== null && drawerMode === 'view',
  })

  const hospedesOptionsQuery = useQuery({
    queryKey: ['hospedes', 'options', 'reservas'],
    queryFn: () =>
      listHospedes({
        page: 1,
        pageSize: 100,
        sortField: 'nomeCompleto',
        sortOrder: 'asc',
        ativo: true,
      }),
    placeholderData: keepPreviousData,
  })

  const selectedHospedeQuery = useQuery({
    queryKey: ['hospedes', 'detail', 'reservas', formState.hospedeResponsavelId],
    queryFn: () => getHospede(Number(formState.hospedeResponsavelId)),
    enabled: drawerMode === 'create' && Boolean(formState.hospedeResponsavelId),
  })

  const categoriasOptionsQuery = useQuery({
    queryKey: ['categorias', 'options', 'reserva-form'],
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
    queryKey: ['subcategorias', 'options', 'reserva-form', formState.categoriaId],
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

  const disponibilidadeFormQuery = useQuery({
    queryKey: ['reservas', 'disponibilidade', 'form', buildAvailabilityContext(formState)],
    queryFn: () =>
      listDisponibilidade({
        page: 1,
        pageSize: 100,
        dataInicio: formState.dataInicio,
        dataFim: formState.dataFim,
        categoriaId: formState.categoriaId ? Number(formState.categoriaId) : undefined,
        subcategoriaId: formState.subcategoriaId ? Number(formState.subcategoriaId) : undefined,
      }),
    enabled:
      drawerMode === 'create' &&
      isDateRangeValid(formState.dataInicio, formState.dataFim),
    placeholderData: keepPreviousData,
  })

  const acompanhantesOptions = selectedHospedeQuery.data?.acompanhantes || []
  const quantidadeHospedes = formState.hospedeResponsavelId ? 1 + formState.acompanhanteIds.length : 0

  const disponibilidadeOptions = useMemo(() => {
    return (disponibilidadeFormQuery.data?.data || []).filter(
      (flat) => flat.disponivel && quantidadeHospedes <= flat.subcategoria.capacidadeMaxima,
    )
  }, [disponibilidadeFormQuery.data?.data, quantidadeHospedes])

  const selectedFlat = useMemo(() => {
    if (formState.flatId) {
      return (
        disponibilidadeOptions.find((flat) => flat.id === Number(formState.flatId)) ||
        disponibilidadeFormQuery.data?.data.find((flat) => flat.id === Number(formState.flatId)) ||
        null
      )
    }

    return contextualFlat
  }, [contextualFlat, disponibilidadeFormQuery.data?.data, disponibilidadeOptions, formState.flatId])

  const resumoFinanceiro = useMemo(() => {
    const valorBaseContratado = selectedFlat?.subcategoria.precoBase || 0
    const valorCafePorPessoa = formState.cafeContratado
      ? normalizeMoneyInput(formState.valorCafePorPessoa)
      : 0
    const valorCafeContratado =
      valorCafePorPessoa > 0 && quantidadeHospedes > 0 ? valorCafePorPessoa * quantidadeHospedes : 0

    return {
      quantidadeHospedes,
      valorBaseContratado,
      valorCafeContratado,
      valorTotalContratado: valorBaseContratado + valorCafeContratado,
    }
  }, [formState.cafeContratado, formState.valorCafePorPessoa, quantidadeHospedes, selectedFlat])

  async function invalidateQueries() {
    await queryClient.invalidateQueries({ queryKey: ['reservas'] })
    await queryClient.invalidateQueries({ queryKey: ['flats'] })
  }

  const saveReservaMutation = useMutation({
    mutationFn: async () => {
      const parsed = reservaFormSchema.safeParse(formState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      return createReserva(normalizeReservaCreatePayload(parsed.data))
    },
    onSuccess: async (reserva) => {
      await invalidateQueries()
      setFeedbackMessage(`Reserva ${reserva.id} criada com sucesso para o flat ${reserva.flat.numero}.`)
      closeDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel criar a reserva com os dados informados.',
      )
    },
  })

  function openCreate(initialState?: Partial<ReservaFormState>) {
    setDrawerMode('create')
    setSelectedReservaId(null)
    setContextualFlat(null)
    setFormState({
      ...defaultReservaFormState,
      ...initialState,
      acompanhanteIds: initialState?.acompanhanteIds || [],
    })
    setFormError(null)
  }

  function openAvailability(flat: DisponibilidadeFlat, context: AvailabilityContext) {
    setDrawerMode('availability')
    setSelectedReservaId(null)
    setContextualFlat(flat)
    setFormState({
      ...defaultReservaFormState,
      dataInicio: context.dataInicio,
      dataFim: context.dataFim,
      categoriaId: context.categoriaId,
      subcategoriaId: context.subcategoriaId,
      flatId: String(flat.id),
    })
    setFormError(null)
  }

  function startCreateFromAvailability() {
    if (!contextualFlat) {
      openCreate()
      return
    }

    openCreate({
      ...buildAvailabilityContext(formState),
      flatId: String(contextualFlat.id),
    })
  }

  function openView(reserva: { id: number }) {
    setDrawerMode('view')
    setSelectedReservaId(reserva.id)
    setContextualFlat(null)
    setFormError(null)
  }

  function closeDrawer() {
    setDrawerMode(null)
    setSelectedReservaId(null)
    setContextualFlat(null)
    setFormState(defaultReservaFormState)
    setFormError(null)
  }

  function submitForm() {
    setFormError(null)
    saveReservaMutation.mutate()
  }

  function handleFormStateChange(nextState: ReservaFormState) {
    let updatedState = nextState

    if (nextState.hospedeResponsavelId !== formState.hospedeResponsavelId) {
      updatedState = {
        ...updatedState,
        acompanhanteIds: [],
      }
    }

    if (nextState.categoriaId !== formState.categoriaId) {
      updatedState = {
        ...updatedState,
        subcategoriaId: '',
        flatId: '',
      }
    }

    if (
      nextState.subcategoriaId !== formState.subcategoriaId ||
      nextState.dataInicio !== formState.dataInicio ||
      nextState.dataFim !== formState.dataFim
    ) {
      updatedState = {
        ...updatedState,
        flatId: '',
      }
    }

    setFormState(updatedState)
  }

  return {
    acompanhantesOptions,
    categoriasOptions: (categoriasOptionsQuery.data?.data || []) as CategoriaListItem[],
    closeDrawer,
    contextualFlat,
    disponibilidadeFormQuery,
    disponibilidadeOptions,
    drawerMode,
    feedbackMessage,
    formError,
    formState,
    handleFormStateChange,
    hospedesOptions: (hospedesOptionsQuery.data?.data || []) as HospedeListItem[],
    openAvailability,
    openCreate,
    openView,
    resumoFinanceiro,
    saveReservaMutation,
    selectedFlat,
    selectedHospedeQuery,
    selectedReservaQuery,
    startCreateFromAvailability,
    submitForm,
    subcategoriasOptions: (subcategoriasOptionsQuery.data?.data || []) as SubcategoriaListItem[],
  }
}

function normalizeMoneyInput(value: string) {
  const normalized = Number(value.replace(',', '.'))
  return Number.isFinite(normalized) && normalized > 0 ? normalized : 0
}
