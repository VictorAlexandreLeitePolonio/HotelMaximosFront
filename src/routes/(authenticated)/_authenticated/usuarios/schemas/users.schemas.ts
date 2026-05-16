import { z } from 'zod'
import type {
  CreateUserInput,
  UpdateUserInput,
  UserProfile,
  UsersQuery,
} from '@/lib/api-contracts'

export const userFormSchema = z.object({
  login: z.string().trim().min(1, 'Informe o login.'),
  nomeCompleto: z.string().trim().min(1, 'Informe o nome completo.'),
  email: z.string().trim().email('Informe um email valido.').or(z.literal('')).optional(),
  perfil: z.enum(['Admin', 'Recepcionista']),
  senha: z.string().optional(),
})

export type DrawerMode = 'create' | 'view' | 'edit'

export type UserFormState = {
  login: string
  nomeCompleto: string
  email: string
  perfil: UserProfile
  senha: string
}

export const defaultUsersFilters: UsersQuery = {
  page: 1,
  pageSize: 10,
  sortField: 'criadoEm',
  sortOrder: 'desc',
}

export const defaultUserFormState: UserFormState = {
  login: '',
  nomeCompleto: '',
  email: '',
  perfil: 'Recepcionista',
  senha: '',
}

export function normalizeCreateUserPayload(
  data: z.infer<typeof userFormSchema>,
): CreateUserInput {
  return {
    login: data.login,
    nomeCompleto: data.nomeCompleto,
    email: data.email?.trim() ? data.email.trim() : null,
    perfil: data.perfil,
    senha: data.senha?.trim() ? data.senha.trim() : undefined,
  }
}

export function normalizeUpdateUserPayload(
  data: z.infer<typeof userFormSchema>,
): UpdateUserInput {
  return normalizeCreateUserPayload(data)
}
