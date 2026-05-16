import type { AuthResponse, SafeAuthUser } from '@/lib/api-contracts'
import { deleteCookie, getCookie, setCookie } from '@/lib/cookies'
import { ApiError, rawApiFetch } from '@/lib/api-core'
import { useAuthStore } from '@/stores/auth-store'

const ACCESS_TOKEN_COOKIE = 'hotel_maximos_access_token'
const REFRESH_TOKEN_COOKIE = 'hotel_maximos_refresh_token'
const USER_COOKIE = 'hotel_maximos_user'

let refreshPromise: Promise<AuthResponse> | null = null

function persistSession(session: AuthResponse) {
  setCookie(ACCESS_TOKEN_COOKIE, session.accessToken)
  setCookie(REFRESH_TOKEN_COOKIE, session.refreshToken)
  setCookie(USER_COOKIE, JSON.stringify(session.user))
}

function clearPersistedSession() {
  deleteCookie(ACCESS_TOKEN_COOKIE)
  deleteCookie(REFRESH_TOKEN_COOKIE)
  deleteCookie(USER_COOKIE)
}

function readPersistedUser(): SafeAuthUser | null {
  const encodedUser = getCookie(USER_COOKIE)

  if (!encodedUser) {
    return null
  }

  try {
    return JSON.parse(encodedUser) as SafeAuthUser
  } catch {
    return null
  }
}

export function bootstrapAuthSession() {
  const store = useAuthStore.getState()
  const accessToken = getCookie(ACCESS_TOKEN_COOKIE)
  const refreshToken = getCookie(REFRESH_TOKEN_COOKIE)
  const user = readPersistedUser()

  if (accessToken && refreshToken && user) {
    store.setSession({ accessToken, refreshToken, user })
    return
  }

  if (!refreshToken) {
    clearPersistedSession()
    store.clearSession()
    return
  }

  store.setHydrating()
  useAuthStore.setState({
    accessToken: accessToken ?? null,
    refreshToken,
    user,
  })

  void refreshSession().catch(() => {
    clearAuthSession()
  })
}

export async function loginSession(input: {
  login: string
  senha: string
}): Promise<AuthResponse> {
  const response = await rawApiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    json: input,
  })

  persistSession(response)
  useAuthStore.getState().setSession(response)
  return response
}

export async function refreshSession(): Promise<AuthResponse> {
  if (refreshPromise) {
    return refreshPromise
  }

  const refreshToken =
    useAuthStore.getState().refreshToken || getCookie(REFRESH_TOKEN_COOKIE)

  if (!refreshToken) {
    throw new ApiError('Sessao expirada. Faca login novamente.', 401, 'AUTH_004')
  }

  refreshPromise = rawApiFetch<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    json: { refreshToken },
  })

  try {
    const response = await refreshPromise
    persistSession(response)
    useAuthStore.getState().setSession(response)
    return response
  } catch (error) {
    clearAuthSession()
    throw error
  } finally {
    refreshPromise = null
  }
}

export async function logoutSession(): Promise<void> {
  const refreshToken =
    useAuthStore.getState().refreshToken || getCookie(REFRESH_TOKEN_COOKIE)

  try {
    if (refreshToken) {
      await rawApiFetch<null>('/api/auth/logout', {
        method: 'POST',
        json: { refreshToken },
      })
    }
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error
    }
  } finally {
    clearAuthSession()
  }
}

export function clearAuthSession() {
  clearPersistedSession()
  useAuthStore.getState().clearSession()
}
