import { refreshSession } from '@/lib/auth-session'
import { rawApiFetch } from '@/lib/api-core'
import { useAuthStore } from '@/stores/auth-store'
import type {
  AuthResponse,
  CreateUserInput,
  PaginatedResponse,
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

export type { AuthResponse }
