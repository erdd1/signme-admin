import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'

import type { SortieFinanciere, SortiesFilters } from '../types'

export interface SortiesPage {
  sorties: SortieFinanciere[]
  pagination: PaginationMeta
}

export async function getSorties(filters: SortiesFilters): Promise<SortiesPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<SortieFinanciere>>(
    '/admin/sorties-financieres',
    {
      params: {
        church_id: filters.churchId,
        type: filters.type,
        statut: filters.statut,
        page: filters.page,
        per_page: filters.perPage ?? 20,
      },
    },
  )
  return { sorties: data.data, pagination: data.pagination }
}

export async function getPendingSorties(page = 1): Promise<SortiesPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<SortieFinanciere>>(
    '/admin/sorties-financieres/pending',
    { params: { page, per_page: 20 } },
  )
  return { sorties: data.data, pagination: data.pagination }
}

export async function approveSortie(uuid: string): Promise<SortieFinanciere> {
  const { data } = await httpClient.post<ApiEnvelope<SortieFinanciere>>(
    `/admin/sorties-financieres/${uuid}/approve`,
  )
  return data.data
}

export async function rejectSortie(uuid: string, motif: string): Promise<SortieFinanciere> {
  const { data } = await httpClient.post<ApiEnvelope<SortieFinanciere>>(
    `/admin/sorties-financieres/${uuid}/reject`,
    { motif },
  )
  return data.data
}
