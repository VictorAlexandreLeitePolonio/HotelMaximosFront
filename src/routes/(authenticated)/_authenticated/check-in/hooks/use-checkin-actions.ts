import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type {
  CheckInDoDiaItem,
  DisponibilidadeFlat,
  HospedeListItem,
} from '@/lib/api-contracts'
import { ApiError } from '@/lib/api-core'
import {
  checkInDireto,
  checkInReserva,
  getHospede,
  listDisponibilidade,
  listHospedes,
} from '@/lib/http'
import {
  buildCheckInResultMessage,
  buildDefaultCheckInReservaFormState,
  checkInDiretoFormSchema,
  checkInReservaFormSchema,
  defaultCheckInDiretoFormState,
  normalizeCheckInDiretoPayload,
  normalizeCheckInReservaPayload,
  normalizeMoneyInput,
  requiresProof,
  reserveTwoDecimals,
  toDateInputValue,
  type CheckInDiretoFormState,
  type CheckInDrawerMode,
  type CheckInReservaFormState,
} from '@/routes/(authenticated)/_authenticated/check-in/schemas/checkin.schemas'

export function useCheckInActions() {
  const queryClient = useQueryClient()
  const [drawerMode, setDrawerMode] = useState<CheckInDrawerMode | null>(null)
  const [selectedReserva, setSelectedReserva] = useState<CheckInDoDiaItem | null>(null)
  const [reservaFormState, setReservaFormState] = useState<CheckInReservaFormState | null>(null)
  const [diretoFormState, setDiretoFormState] = useState<CheckInDiretoFormState>(
    defaultCheckInDiretoFormState,
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const hospedesOptionsQuery = useQuery({
    queryKey: ['hospedes', 'options', 'check-in-direto'],
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
    queryKey: ['hospedes', 'detail', 'check-in-direto', diretoFormState.hospedeResponsavelId],
    queryFn: () => getHospede(Number(diretoFormState.hospedeResponsavelId)),
    enabled: drawerMode === 'direct' && Boolean(diretoFormState.hospedeResponsavelId),
  })

  const disponibilidadeDiretoQuery = useQuery({
    queryKey: [
      'check-in-direto',
      'disponibilidade',
      diretoFormState.dataInicio,
      diretoFormState.dataFimPrevista,
    ],
    queryFn: () =>
      listDisponibilidade({
        page: 1,
        pageSize: 100,
        dataInicio: toDateInputValue(new Date(diretoFormState.dataInicio).toISOString()),
        dataFim: diretoFormState.dataFimPrevista,
      }),
    enabled: drawerMode === 'direct' && Boolean(diretoFormState.dataInicio && diretoFormState.dataFimPrevista),
    placeholderData: keepPreviousData,
  })

  const acompanhantesOptions = selectedHospedeQuery.data?.acompanhantes || []

  const disponibilidadeDiretoOptions = useMemo(() => {
    return (disponibilidadeDiretoQuery.data?.data || []).filter((flat) => flat.disponivel)
  }, [disponibilidadeDiretoQuery.data?.data])

  const selectedFlat = useMemo(() => {
    if (!diretoFormState.flatId) {
      return null
    }

    return (
      disponibilidadeDiretoOptions.find((flat) => flat.id === Number(diretoFormState.flatId)) ||
      disponibilidadeDiretoQuery.data?.data.find((flat) => flat.id === Number(diretoFormState.flatId)) ||
      null
    )
  }, [diretoFormState.flatId, disponibilidadeDiretoOptions, disponibilidadeDiretoQuery.data?.data])

  const resumoDireto = useMemo(() => {
    const quantidadeHospedes = diretoFormState.hospedeResponsavelId
      ? 1 + diretoFormState.acompanhanteIds.length
      : 0
    const valorBaseContratado = selectedFlat?.subcategoria.precoBase || 0
    const valorCafePorPessoa = diretoFormState.cafeContratado
      ? normalizeMoneyInput(diretoFormState.valorCafePorPessoa)
      : 0
    const valorCafeContratado =
      quantidadeHospedes > 0 && valorCafePorPessoa > 0 ? quantidadeHospedes * valorCafePorPessoa : 0

    return {
      quantidadeHospedes,
      valorBaseContratado,
      valorCafeContratado,
      valorTotalContratado: valorBaseContratado + valorCafeContratado,
    }
  }, [
    diretoFormState.acompanhanteIds.length,
    diretoFormState.cafeContratado,
    diretoFormState.hospedeResponsavelId,
    diretoFormState.valorCafePorPessoa,
    selectedFlat,
  ])

  async function invalidateQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['check-in-do-dia'] }),
      queryClient.invalidateQueries({ queryKey: ['estadias-ativas'] }),
      queryClient.invalidateQueries({ queryKey: ['reservas'] }),
      queryClient.invalidateQueries({ queryKey: ['flats'] }),
    ])
  }

  const checkInReservaMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReserva || !reservaFormState) {
        throw new ApiError('Selecione uma reserva para continuar.', 400)
      }

      const parsed = checkInReservaFormSchema.safeParse(reservaFormState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      const payload = normalizeCheckInReservaPayload(parsed.data)

      if (payload.valorPago !== Number(selectedReserva.valorTotalContratado.toFixed(2))) {
        throw new ApiError('O check-in exige pagamento integral da primeira mensalidade.', 400)
      }

      return checkInReserva(selectedReserva.id, payload)
    },
    onSuccess: async (result) => {
      await invalidateQueries()
      setFeedbackMessage(buildCheckInResultMessage(result))
      closeDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel concluir o check-in da reserva.',
      )
    },
  })

  const checkInDiretoMutation = useMutation({
    mutationFn: async () => {
      const parsed = checkInDiretoFormSchema.safeParse(diretoFormState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      const payload = normalizeCheckInDiretoPayload(parsed.data)

      if (payload.valorPago !== Number(resumoDireto.valorTotalContratado.toFixed(2))) {
        throw new ApiError('O check-in exige pagamento integral da primeira mensalidade.', 400)
      }

      return checkInDireto(payload)
    },
    onSuccess: async (result) => {
      await invalidateQueries()
      setFeedbackMessage(buildCheckInResultMessage(result))
      closeDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel concluir o check-in direto.',
      )
    },
  })

  function openReservationCheckIn(reserva: CheckInDoDiaItem) {
    setDrawerMode('reservation')
    setSelectedReserva(reserva)
    setReservaFormState(buildDefaultCheckInReservaFormState(reserva))
    setFormError(null)
  }

  function openDirectCheckIn() {
    setDrawerMode('direct')
    setSelectedReserva(null)
    setReservaFormState(null)
    setDiretoFormState(defaultCheckInDiretoFormState)
    setFormError(null)
  }

  function closeDrawer() {
    setDrawerMode(null)
    setSelectedReserva(null)
    setReservaFormState(null)
    setDiretoFormState(defaultCheckInDiretoFormState)
    setFormError(null)
  }

  function handleReservaFormChange(nextState: CheckInReservaFormState) {
    setReservaFormState(nextState)
  }

  function handleDiretoFormChange(nextState: CheckInDiretoFormState) {
    let updatedState = nextState

    if (nextState.hospedeResponsavelId !== diretoFormState.hospedeResponsavelId) {
      updatedState = {
        ...updatedState,
        acompanhanteIds: [],
      }
    }

    if (
      nextState.dataInicio !== diretoFormState.dataInicio ||
      nextState.dataFimPrevista !== diretoFormState.dataFimPrevista
    ) {
      updatedState = {
        ...updatedState,
        flatId: '',
      }
    }

    if (!nextState.cafeContratado && nextState.valorCafePorPessoa !== '0.00') {
      updatedState = {
        ...updatedState,
        valorCafePorPessoa: '0.00',
      }
    }

    setDiretoFormState(updatedState)
  }

  return {
    acompanhantesOptions,
    availabilityHelperMessage:
      disponibilidadeDiretoQuery.data?.data.length === 0
        ? 'Nenhum flat retornou disponivel para o periodo informado.'
        : null,
    checkInDiretoMutation,
    checkInReservaMutation,
    closeDrawer,
    diretoFormState,
    disponibilidadeDiretoOptions: disponibilidadeDiretoOptions as DisponibilidadeFlat[],
    drawerMode,
    feedbackMessage,
    formError,
    handleDiretoFormChange,
    handleReservaFormChange,
    hospedesOptions: (hospedesOptionsQuery.data?.data || []) as HospedeListItem[],
    openDirectCheckIn,
    openReservationCheckIn,
    requiresDiretoProof:
      drawerMode === 'direct' && requiresProof(diretoFormState.formaPagamento),
    requiresReservaProof:
      drawerMode === 'reservation' &&
      requiresProof(reservaFormState?.formaPagamento || ''),
    reservaFormState,
    reservaTotalEsperado: selectedReserva ? reserveTwoDecimals(selectedReserva.valorTotalContratado) : '0.00',
    resumoDireto,
    selectedFlat,
    selectedReserva,
    submitDirectCheckIn: () => {
      setFormError(null)
      checkInDiretoMutation.mutate()
    },
    submitReservationCheckIn: () => {
      setFormError(null)
      checkInReservaMutation.mutate()
    },
  }
}
