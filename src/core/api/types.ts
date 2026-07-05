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

/**
 * Forme de pagination native de Laravel (`->paginate()` renvoyé tel quel,
 * sans passer par `paginatedResponse()`) — utilisée par certains endpoints
 * admin plus anciens (ex: /admin/signature-logs) au lieu du format maison
 * `PaginatedEnvelope`.
 */
export interface LaravelPageEnvelope<T> {
  success: boolean
  message: string
  data: {
    current_page: number
    data: T[]
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}
