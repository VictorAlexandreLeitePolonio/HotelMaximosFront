import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { HospedeListItem } from '@/lib/api-contracts'
import { ApiError } from '@/lib/api-core'
import { createHospede, deleteHospede, getHospede, updateHospede } from '@/lib/http'
import {
  defaultHospedeFormState,
  hospedeFormSchema,
  mapHospedeToFormState,
  normalizeHospedeCreatePayload,
  normalizeHospedeUpdatePayload,
  type DrawerMode,
  type HospedeFormState,
} from '@/routes/(authenticated)/_authenticated/hospedes/schemas/hospedes.schemas'

export function useHospedeActions() {
  const queryClient = useQueryClient()
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null)
  const [selectedHospedeId, setSelectedHospedeId] = useState<number | null>(null)
  const [formState, setFormState] = useState<HospedeFormState>(defaultHospedeFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const selectedHospedeQuery = useQuery({
    queryKey: ['hospedes', 'detail', selectedHospedeId],
    queryFn: () => getHospede(selectedHospedeId as number),
    enabled: selectedHospedeId !== null && drawerMode !== 'create',
  })

  useEffect(() => {
    if (!selectedHospedeQuery.data || drawerMode === 'create') {
      return
    }

    setFormState(mapHospedeToFormState(selectedHospedeQuery.data))
  }, [drawerMode, selectedHospedeQuery.data])

  async function invalidateHospedes() {
    await queryClient.invalidateQueries({ queryKey: ['hospedes'] })
  }

  const saveHospedeMutation = useMutation({
    mutationFn: async () => {
      const parsed = hospedeFormSchema.safeParse(formState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      if (drawerMode === 'create') {
        return createHospede(normalizeHospedeCreatePayload(parsed.data))
      }

      if (!selectedHospedeId) {
        throw new ApiError('Hospede nao selecionado.', 400)
      }

      return updateHospede(selectedHospedeId, normalizeHospedeUpdatePayload(parsed.data))
    },
    onSuccess: async (hospede) => {
      await invalidateHospedes()
      setFeedbackMessage(
        drawerMode === 'create'
          ? `Hospede ${hospede.nomeCompleto} criado com sucesso.`
          : `Hospede ${hospede.nomeCompleto} atualizado com sucesso.`,
      )
      closeDrawer()
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : 'Nao foi possivel salvar o hospede.')
    },
  })

  const deleteHospedeMutation = useMutation({
    mutationFn: async (id: number) => deleteHospede(id),
    onSuccess: async () => {
      await invalidateHospedes()
      setFeedbackMessage('Hospede inativado com sucesso.')
      closeDrawer()
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError ? error.message : 'Nao foi possivel inativar o hospede.',
      )
    },
  })

  function openCreate() {
    setDrawerMode('create')
    setSelectedHospedeId(null)
    setFormState(defaultHospedeFormState)
    setFormError(null)
    setFeedbackMessage(null)
  }

  function openView(hospede: HospedeListItem) {
    openWithHospede('view', hospede)
  }

  function openEdit(hospede: HospedeListItem) {
    openWithHospede('edit', hospede)
  }

  function openWithHospede(mode: Exclude<DrawerMode, 'create'>, hospede: HospedeListItem) {
    setDrawerMode(mode)
    setSelectedHospedeId(hospede.id)
    setFormError(null)
    setFeedbackMessage(null)
    setFormState({
      nomeCompleto: hospede.nomeCompleto,
      cpf: hospede.cpf,
      email: hospede.email,
      endereco: hospede.endereco,
      telefone: hospede.telefone,
      documento: hospede.documento,
      empresa: hospede.empresa || '',
      acompanhantes: [],
    })
  }

  function closeDrawer() {
    setDrawerMode(null)
    setSelectedHospedeId(null)
    setFormState(defaultHospedeFormState)
    setFormError(null)
  }

  function submitForm() {
    setFormError(null)
    saveHospedeMutation.mutate()
  }

  return {
    closeDrawer,
    deleteHospedeMutation,
    drawerMode,
    feedbackMessage,
    formError,
    formState,
    openCreate,
    openEdit,
    openView,
    saveHospedeMutation,
    selectedHospedeId,
    selectedHospedeQuery,
    setFormState,
    submitForm,
  }
}
