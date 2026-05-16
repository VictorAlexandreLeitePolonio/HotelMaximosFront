export type UserProfile = 'Admin' | 'Recepcionista'

export type SafeAuthUser = {
  id: number
  login: string
  nomeCompleto: string
  email: string | null
  perfil: UserProfile
  ativo: boolean
  deveAlterarSenha: boolean
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: SafeAuthUser
}

export type ApiErrorResponse = {
  error: {
    code: string
    message: string
    traceId?: string
    details?: unknown
  }
}

export type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export type UserListItem = SafeAuthUser & {
  criadoEm: string
  atualizadoEm: string
}

export type UsersQuery = {
  page: number
  pageSize: number
  search?: string
  perfil?: UserProfile
  ativo?: boolean
  sortField?:
    | 'login'
    | 'nomeCompleto'
    | 'email'
    | 'perfil'
    | 'ativo'
    | 'criadoEm'
    | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type CreateUserInput = {
  login: string
  nomeCompleto: string
  email?: string | null
  perfil: UserProfile
  senha?: string | null
}

export type UpdateUserInput = Partial<CreateUserInput>
