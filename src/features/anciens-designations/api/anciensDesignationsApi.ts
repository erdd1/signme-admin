import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope } from '@/core/api/types'
import type {
  AncienDesignationCreated,
  AnciensDesignationsData,
  AnciensDesignationsFilters,
  DesignerAncienPayload,
} from '@/features/anciens-designations/types'

export async function getAnciensDesignations(
  filters: AnciensDesignationsFilters,
): Promise<AnciensDesignationsData> {
  const { data } = await httpClient.get<ApiEnvelope<AnciensDesignationsData>>(
    '/admin/anciens-designations',
    {
      params: {
        mois: filters.mois,
        annee: filters.annee,
        church_id: filters.churchId,
      },
    },
  )
  return data.data
}

export async function designerAncien(
  payload: DesignerAncienPayload,
): Promise<AncienDesignationCreated> {
  const { data } = await httpClient.post<ApiEnvelope<AncienDesignationCreated>>(
    '/admin/anciens-designations',
    payload,
  )
  return data.data
}

export async function retirerDesignation(designationId: number): Promise<void> {
  await httpClient.delete(`/admin/anciens-designations/${designationId}`)
}

export async function syncDesignationFlags(churchId?: number): Promise<void> {
  await httpClient.post('/admin/anciens-designations/sync', { church_id: churchId })
}
