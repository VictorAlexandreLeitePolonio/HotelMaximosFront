import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { UserListItem } from '@/lib/api-contracts'
import { ApiError } from '@/lib/api-core'
import {
  createUser,
  getUser,
  resetUserPassword,
  updateUser,
  updateUserStatus,
} from '@/lib/http'
import {
  defaultUserFormState,
  normalizeCreateUserPayload,
  normalizeUpdateUserPayload,
  type DrawerMode,
  type UserFormState,
  userFormSchema,
} from '@/routes/(authenticated)/_authenticated/usuarios/schemas/users.schemas'

export function useUserActions() {
  const queryClient = useQueryClient()
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [formState, setFormState] = useState<UserFormState>(defaultUserFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const selectedUserQuery = useQuery({
    queryKey: ['users', 'detail', selectedUserId],
    queryFn: () => getUser(selectedUserId as number),
    enabled: selectedUserId !== null && drawerMode !== 'create',
  })

  useEffect(() => {
    if (!selectedUserQuery.data || drawerMode === 'create') {
      return
    }

    setFormState({
      login: selectedUserQuery.data.login,
      nomeCompleto: selectedUserQuery.data.nomeCompleto,
      email: selectedUserQuery.data.email || '',
      perfil: selectedUserQuery.data.perfil,
      senha: '',
    })
  }, [drawerMode, selectedUserQuery.data])

  async function invalidateUsers() {
    await queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  const saveUserMutation = useMutation({
    mutationFn: async () => {
      const parsed = userFormSchema.safeParse(formState)

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Formulario invalido.', 400)
      }

      if (drawerMode === 'create') {
        return createUser(normalizeCreateUserPayload(parsed.data))
      }

      if (!selectedUserId) {
        throw new ApiError('Usuario nao selecionado.', 400)
      }

      return updateUser(selectedUserId, normalizeUpdateUserPayload(parsed.data))
    },
    onSuccess: async (user) => {
      await invalidateUsers()
      setFeedbackMessage(
        drawerMode === 'create'
          ? `Usuario ${user.login} criado com sucesso.`
          : `Usuario ${user.login} atualizado com sucesso.`,
      )
      closeDrawer()
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : 'Nao foi possivel salvar o usuario.')
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: number; ativo: boolean }) => {
      return updateUserStatus(id, ativo)
    },
    onSuccess: async (user) => {
      await invalidateUsers()
      setFeedbackMessage(
        user.ativo
          ? `Usuario ${user.login} ativado com sucesso.`
          : `Usuario ${user.login} inativado com sucesso.`,
      )
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: number) => resetUserPassword(id),
    onSuccess: async (user) => {
      await invalidateUsers()
      setFeedbackMessage(`Senha de ${user.login} resetada para o padrao local.`)
    },
  })

  function openCreate() {
    setDrawerMode('create')
    setSelectedUserId(null)
    setFormState(defaultUserFormState)
    setFormError(null)
    setFeedbackMessage(null)
  }

  function openView(user: UserListItem) {
    openWithUser('view', user)
  }

  function openEdit(user: UserListItem) {
    openWithUser('edit', user)
  }

  function openWithUser(mode: Exclude<DrawerMode, 'create'>, user: UserListItem) {
    setDrawerMode(mode)
    setSelectedUserId(user.id)
    setFormError(null)
    setFeedbackMessage(null)
    setFormState({
      login: user.login,
      nomeCompleto: user.nomeCompleto,
      email: user.email || '',
      perfil: user.perfil,
      senha: '',
    })
  }

  function closeDrawer() {
    setDrawerMode(null)
    setSelectedUserId(null)
    setFormState(defaultUserFormState)
    setFormError(null)
  }

  function submitForm() {
    setFormError(null)
    saveUserMutation.mutate()
  }

  return {
    closeDrawer,
    drawerMode,
    feedbackMessage,
    formError,
    formState,
    openCreate,
    openEdit,
    openView,
    resetPasswordMutation,
    saveUserMutation,
    selectedUserId,
    selectedUserQuery,
    setFormState,
    statusMutation,
    submitForm,
  }
}
