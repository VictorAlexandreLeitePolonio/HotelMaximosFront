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

export type HospedeAcompanhante = {
  id: number
  nomeCompleto: string
  documento: string | null
  menorDeIdade: boolean
  criadoEm: string
  atualizadoEm: string
}

export type HospedeResponsavel = {
  id: number
  nomeCompleto: string
  cpf: string
  email: string
  endereco: string
  telefone: string
  documento: string
  empresa: string | null
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
  acompanhantes: HospedeAcompanhante[]
}

export type HospedeListItem = Omit<HospedeResponsavel, 'acompanhantes'> & {
  acompanhantesCount: number
}

export type HospedesQuery = {
  page: number
  pageSize: number
  search?: string
  cpf?: string
  ativo?: boolean
  sortField?: 'nomeCompleto' | 'cpf' | 'email' | 'criadoEm' | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type AcompanhanteInput = {
  id?: number
  nomeCompleto: string
  documento?: string
  menorDeIdade: boolean
}

export type CreateHospedeInput = {
  nomeCompleto: string
  cpf: string
  email: string
  endereco: string
  telefone: string
  documento: string
  empresa?: string
  acompanhantes?: AcompanhanteInput[]
}

export type UpdateHospedeInput = Partial<CreateHospedeInput>
