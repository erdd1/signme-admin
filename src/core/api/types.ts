export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface PaginatedEnvelope<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}
