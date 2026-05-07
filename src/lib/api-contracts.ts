export type PaginatedResponse<T> = {
  data: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type ApiErrorResponse = {
  errorNumber: string
  message: string
  details?: string
  traceId: string
  errors?: Record<string, string[]>
}
