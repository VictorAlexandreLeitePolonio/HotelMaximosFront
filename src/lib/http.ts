import { refreshSession } from '@/lib/auth-session'
import { rawApiFetch } from '@/lib/api-core'
import { useAuthStore } from '@/stores/auth-store'
import type {
  AuthResponse,
  CategoriaDetail,
  CategoriaListItem,
  CategoriaQuery,
  CreateReservaInput,
  CreateCategoriaInput,
  CreateHospedeInput,
  CreateFlatInput,
  CreateSubcategoriaInput,
  CreateUserInput,
  DisponibilidadeFlat,
  DisponibilidadeQuery,
  Flat,
  FlatListItem,
  FlatsQuery,
  HospedeListItem,
  HospedeResponsavel,
  HospedesQuery,
  PaginatedResponse,
  Reserva,
  ReservaListItem,
  ReservasQuery,
  Subcategoria,
  SubcategoriaListItem,
  SubcategoriasQuery,
  UpdateCategoriaInput,
  UpdateFlatInput,
  UpdateHospedeInput,
  UpdateSubcategoriaInput,
  UpdateUserInput,
  UserListItem,
  UsersQuery,
} from '@/lib/api-contracts'
import { ApiError } from '@/lib/api-core'

type RequestOptions = {
  auth?: boolean
  retryOn401?: boolean
}

async function executeRequest<T>(
  path: string,
  init: RequestInit & { json?: unknown },
  options: RequestOptions,
): Promise<T> {
  const headers = new Headers(init.headers)

  if (options.auth !== false) {
    const token = useAuthStore.getState().accessToken

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  try {
    return await rawApiFetch<T>(path, {
      ...init,
      headers,
    })
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      options.auth !== false &&
      options.retryOn401 !== false
    ) {
      const session = await refreshSession()
      headers.set('Authorization', `Bearer ${session.accessToken}`)

      return rawApiFetch<T>(path, {
        ...init,
        headers,
      })
    }

    throw error
  }
}

export function apiRequest<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
  options: RequestOptions = {},
) {
  return executeRequest<T>(path, init, options)
}

export function changePassword(input: {
  senhaAtual: string
  novaSenha: string
}) {
  return apiRequest<null>(
    '/api/auth/password',
    {
      method: 'PATCH',
      json: input,
    },
  )
}

export function listUsers(query: UsersQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortField: query.sortField || 'criadoEm',
    sortOrder: query.sortOrder || 'desc',
  })

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.perfil) {
    params.set('perfil', query.perfil)
  }

  if (query.ativo !== undefined) {
    params.set('ativo', String(query.ativo))
  }

  return apiRequest<PaginatedResponse<UserListItem>>(`/api/users?${params.toString()}`)
}

export function getUser(id: number) {
  return apiRequest<UserListItem>(`/api/users/${id}`)
}

export function createUser(input: CreateUserInput) {
  return apiRequest<UserListItem>(
    '/api/users',
    {
      method: 'POST',
      json: input,
    },
  )
}

export function updateUser(id: number, input: UpdateUserInput) {
  return apiRequest<UserListItem>(
    `/api/users/${id}`,
    {
      method: 'PUT',
      json: input,
    },
  )
}

export function updateUserStatus(id: number, ativo: boolean) {
  return apiRequest<UserListItem>(
    `/api/users/${id}/status`,
    {
      method: 'PUT',
      json: { ativo },
    },
  )
}

export function resetUserPassword(id: number) {
  return apiRequest<UserListItem>(
    `/api/users/${id}/reset-password`,
    {
      method: 'POST',
    },
  )
}

export function listHospedes(query: HospedesQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortField: query.sortField || 'criadoEm',
    sortOrder: query.sortOrder || 'desc',
  })

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.cpf) {
    params.set('cpf', query.cpf)
  }

  if (query.ativo !== undefined) {
    params.set('ativo', String(query.ativo))
  }

  return apiRequest<PaginatedResponse<HospedeListItem>>(`/api/hospedes?${params.toString()}`)
}

export function getHospede(id: number) {
  return apiRequest<HospedeResponsavel>(`/api/hospedes/${id}`)
}

export function createHospede(input: CreateHospedeInput) {
  return apiRequest<HospedeResponsavel>(
    '/api/hospedes',
    {
      method: 'POST',
      json: input,
    },
  )
}

export function updateHospede(id: number, input: UpdateHospedeInput) {
  return apiRequest<HospedeResponsavel>(
    `/api/hospedes/${id}`,
    {
      method: 'PUT',
      json: input,
    },
  )
}

export function deleteHospede(id: number) {
  return apiRequest<null>(
    `/api/hospedes/${id}`,
    {
      method: 'DELETE',
    },
  )
}

export function listCategorias(query: CategoriaQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortField: query.sortField || 'criadoEm',
    sortOrder: query.sortOrder || 'desc',
  })

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.ativo !== undefined) {
    params.set('ativo', String(query.ativo))
  }

  return apiRequest<PaginatedResponse<CategoriaListItem>>(`/api/categorias?${params.toString()}`)
}

export function getCategoria(id: number) {
  return apiRequest<CategoriaDetail>(`/api/categorias/${id}`)
}

export function createCategoria(input: CreateCategoriaInput) {
  return apiRequest<CategoriaDetail>(
    '/api/categorias',
    {
      method: 'POST',
      json: input,
    },
  )
}

export function updateCategoria(id: number, input: UpdateCategoriaInput) {
  return apiRequest<CategoriaDetail>(
    `/api/categorias/${id}`,
    {
      method: 'PUT',
      json: input,
    },
  )
}

export function deleteCategoria(id: number) {
  return apiRequest<null>(
    `/api/categorias/${id}`,
    {
      method: 'DELETE',
    },
  )
}

export function listSubcategorias(query: SubcategoriasQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortField: query.sortField || 'criadoEm',
    sortOrder: query.sortOrder || 'desc',
  })

  if (query.categoriaId) {
    params.set('categoriaId', String(query.categoriaId))
  }

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.ativo !== undefined) {
    params.set('ativo', String(query.ativo))
  }

  return apiRequest<PaginatedResponse<SubcategoriaListItem>>(`/api/subcategorias?${params.toString()}`)
}

export function getSubcategoria(id: number) {
  return apiRequest<Subcategoria>(`/api/subcategorias/${id}`)
}

export function createSubcategoria(input: CreateSubcategoriaInput) {
  return apiRequest<Subcategoria>(
    '/api/subcategorias',
    {
      method: 'POST',
      json: input,
    },
  )
}

export function updateSubcategoria(id: number, input: UpdateSubcategoriaInput) {
  return apiRequest<Subcategoria>(
    `/api/subcategorias/${id}`,
    {
      method: 'PUT',
      json: input,
    },
  )
}

export function deleteSubcategoria(id: number) {
  return apiRequest<null>(
    `/api/subcategorias/${id}`,
    {
      method: 'DELETE',
    },
  )
}

export function listFlats(query: FlatsQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortField: query.sortField || 'criadoEm',
    sortOrder: query.sortOrder || 'desc',
  })

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.categoriaId) {
    params.set('categoriaId', String(query.categoriaId))
  }

  if (query.subcategoriaId) {
    params.set('subcategoriaId', String(query.subcategoriaId))
  }

  if (query.statusOperacional) {
    params.set('statusOperacional', query.statusOperacional)
  }

  if (query.ativo !== undefined) {
    params.set('ativo', String(query.ativo))
  }

  return apiRequest<PaginatedResponse<FlatListItem>>(`/api/flats?${params.toString()}`)
}

export function getFlat(id: number) {
  return apiRequest<Flat>(`/api/flats/${id}`)
}

export function createFlat(input: CreateFlatInput) {
  return apiRequest<Flat>(
    '/api/flats',
    {
      method: 'POST',
      json: input,
    },
  )
}

export function updateFlat(id: number, input: UpdateFlatInput) {
  return apiRequest<Flat>(
    `/api/flats/${id}`,
    {
      method: 'PUT',
      json: input,
    },
  )
}

export function deleteFlat(id: number) {
  return apiRequest<null>(
    `/api/flats/${id}`,
    {
      method: 'DELETE',
    },
  )
}

export function listReservas(query: ReservasQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortField: query.sortField || 'dataInicio',
    sortOrder: query.sortOrder || 'asc',
  })

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.flatId) {
    params.set('flatId', String(query.flatId))
  }

  if (query.hospedeResponsavelId) {
    params.set('hospedeResponsavelId', String(query.hospedeResponsavelId))
  }

  if (query.status) {
    params.set('status', query.status)
  }

  if (query.dataInicio) {
    params.set('dataInicio', query.dataInicio)
  }

  if (query.dataFim) {
    params.set('dataFim', query.dataFim)
  }

  return apiRequest<PaginatedResponse<ReservaListItem>>(`/api/reservas?${params.toString()}`)
}

export function getReserva(id: number) {
  return apiRequest<Reserva>(`/api/reservas/${id}`)
}

export function createReserva(input: CreateReservaInput) {
  return apiRequest<Reserva>(
    '/api/reservas',
    {
      method: 'POST',
      json: input,
    },
  )
}

export function listDisponibilidade(query: DisponibilidadeQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    dataInicio: query.dataInicio,
    dataFim: query.dataFim,
  })

  if (query.categoriaId) {
    params.set('categoriaId', String(query.categoriaId))
  }

  if (query.subcategoriaId) {
    params.set('subcategoriaId', String(query.subcategoriaId))
  }

  return apiRequest<PaginatedResponse<DisponibilidadeFlat>>(
    `/api/reservas/disponibilidade?${params.toString()}`,
  )
}

export type { AuthResponse }
