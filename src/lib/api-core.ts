import type { ApiErrorResponse } from '@/lib/api-contracts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    return normalizedPath
  }

  if (!API_BASE_URL) {
    return normalizedPath
  }

  return `${API_BASE_URL}${normalizedPath}`
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse
    throw new ApiError(
      errorPayload?.error?.message || `Erro HTTP ${response.status}.`,
      response.status,
      errorPayload?.error?.code,
      errorPayload?.error?.details,
    )
  }

  return payload as T
}

export async function rawApiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(init.headers)

  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
    body:
      init.json !== undefined
        ? JSON.stringify(init.json)
        : init.body,
  })

  return parseApiResponse<T>(response)
}
