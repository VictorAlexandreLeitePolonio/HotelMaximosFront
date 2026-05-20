import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { DisponibilidadeFlat, Estadia } from '@/lib/api-contracts'
import { ApiError } from '@/lib/api-core'
import { listDisponibilidade, renovarEstadia, transferirFlatEstadia } from '@/lib/http'
import {
  buildDefaultRenewStayFormState,
  buildDefaultTransferFlatFormState,
  normalizeRenewStayPayload,
  normalizeTransferFlatPayload,
  renewStayFormSchema,
  toDateInputValue,
  transferFlatFormSchema,
  type EstadiaDrawerMode,
  type RenewStayFormState,
  type TransferFlatFormState,
} from '@/routes/(authenticated)/_authenticated/estadias-ativas/schemas/estadias.schemas'

export function useEstadiaActions() {
  const queryClient = useQueryClient()
  const [drawerMode, setDrawerMode] = useState<EstadiaDrawerMode | null>(null)
  const [selectedEstadia, setSelectedEstadia] = useState<Estadia | null>(null)
  const [transferFormState, setTransferFormState] = useState<TransferFlatFormState>(
    buildDefaultTransferFlatFormState(),
  )
  const [renewFormState, setRenewFormState] = useState<RenewStayFormState | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const transferAvailabilityQuery = useQuery({
    queryKey: [
      'estadias-ativas',
      'transfer-disponibilidade',
      selectedEstadia?.id,
      selectedEstadia?.dataFimPrevista,
    ],
    queryFn: () =>
      listDisponibilidade({
        page: 1,
        pageSize: 100,
        dataInicio: toDateInputValue(new Date().toISOString()),
        dataFim: toDateInputValue((selectedEstadia as Estadia).dataFimPrevista),
      }),
    enabled: drawerMode === 'transfer' && Boolean(selectedEstadia),
    placeholderData: keepPreviousData,
  })

  const transferFlatOptions = useMemo(() => {
    if (!selectedEstadia) {
      return []
    }

    return (transferAvailabilityQuery.data?.data || []).filter(
      (flat) => flat.disponivel && flat.id !== selectedEstadia.flatId,
    ) as DisponibilidadeFlat[]
  }, [selectedEstadia, transferAvailabilityQuery.data?.data])

  async function invalidateQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['estadias-ativas'] }),
      queryClient.invalidateQueries({ queryKey: ['check-in-do-dia'] }),
      queryClient.invalidateQueries({ queryKey: ['flats'] }),
      queryClient.invalidateQueries({ queryKey: ['reservas'] }),
    ])
  }

  const transferFlatMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEstadia) {
        throw new ApiError('Selecione uma estadia para transferir.', 400)
      }

      const parsed = transferFlatFormSchema.safeParse(transferFormState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      if (Number(parsed.data.novoFlatId) === selectedEstadia.flatId) {
        throw new ApiError('A troca de flat deve apontar para um flat diferente do atual.', 400)
      }

      return transferirFlatEstadia(selectedEstadia.id, normalizeTransferFlatPayload(parsed.data))
    },
    onSuccess: async (estadia) => {
      await invalidateQueries()
      setFeedbackMessage(`Estadia #${estadia.id} transferida para o flat ${estadia.flat.numero}.`)
      closeDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError ? error.message : 'Nao foi possivel transferir o flat da estadia.',
      )
    },
  })

  const renewStayMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEstadia || !renewFormState) {
        throw new ApiError('Selecione uma estadia para renovar.', 400)
      }

      const parsed = renewStayFormSchema.safeParse(renewFormState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      if (new Date(parsed.data.dataFimPrevista).getTime() <= new Date(selectedEstadia.dataFimPrevista).getTime()) {
        throw new ApiError('A nova data fim prevista deve ser maior que a atual da estadia.', 400)
      }

      return renovarEstadia(selectedEstadia.id, normalizeRenewStayPayload(parsed.data))
    },
    onSuccess: async (estadia) => {
      await invalidateQueries()
      setFeedbackMessage(`Estadia #${estadia.id} renovada ate ${formatDate(estadia.dataFimPrevista)}.`)
      closeDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError ? error.message : 'Nao foi possivel renovar a estadia.',
      )
    },
  })

  function openView(estadia: Estadia) {
    setDrawerMode('view')
    setSelectedEstadia(estadia)
    setFormError(null)
  }

  function openTransfer(estadia: Estadia) {
    setDrawerMode('transfer')
    setSelectedEstadia(estadia)
    setTransferFormState(buildDefaultTransferFlatFormState())
    setRenewFormState(null)
    setFormError(null)
  }

  function openRenew(estadia: Estadia) {
    setDrawerMode('renew')
    setSelectedEstadia(estadia)
    setRenewFormState(buildDefaultRenewStayFormState(estadia))
    setTransferFormState(buildDefaultTransferFlatFormState())
    setFormError(null)
  }

  function closeDrawer() {
    setDrawerMode(null)
    setSelectedEstadia(null)
    setTransferFormState(buildDefaultTransferFlatFormState())
    setRenewFormState(null)
    setFormError(null)
  }

  return {
    closeDrawer,
    drawerMode,
    feedbackMessage,
    formError,
    openRenew,
    openTransfer,
    openView,
    renewFormState,
    renewStayMutation,
    selectedEstadia,
    setRenewFormState,
    setTransferFormState,
    submitRenew: () => {
      setFormError(null)
      renewStayMutation.mutate()
    },
    submitTransfer: () => {
      setFormError(null)
      transferFlatMutation.mutate()
    },
    transferAvailabilityHelperMessage:
      transferAvailabilityQuery.data?.data.length === 0
        ? 'Nenhum flat disponivel retornou para o restante do periodo ativo.'
        : null,
    transferFlatMutation,
    transferFlatOptions,
    transferFormState,
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value))
}
