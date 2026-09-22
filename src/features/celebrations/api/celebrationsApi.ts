import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'

import type {
  Celebration,
  CelebrationInstanceFilters,
  CelebrationType,
  UpdateCelebrationTypePayload,
} from '../types'

export async function getCelebrationTypes(): Promise<CelebrationType[]> {
  const { data } = await httpClient.get<ApiEnvelope<CelebrationType[]>>('/admin/celebration-types')
  return data.data
}

export async function updateCelebrationType(
  id: number,
  payload: UpdateCelebrationTypePayload,
): Promise<CelebrationType> {
  const { data } = await httpClient.put<ApiEnvelope<CelebrationType>>(
    `/admin/celebration-types/${id}`,
    payload,
  )
  return data.data
}

export interface CelebrationsPage {
  celebrations: Celebration[]
  pagination: PaginationMeta
}

export async function getCelebrations(
  filters: CelebrationInstanceFilters,
): Promise<CelebrationsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<Celebration>>('/admin/celebrations', {
    params: {
      churchId: filters.churchId,
      celebrationTypeId: filters.celebrationTypeId,
      page: filters.page,
      per_page: filters.perPage ?? 20,
    },
  })
  return { celebrations: data.data, pagination: data.pagination }
}

export async function deleteCelebration(uuid: string): Promise<void> {
  await httpClient.delete(`/admin/celebrations/${uuid}`)
}
