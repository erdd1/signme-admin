import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'
import type {
  CreateEvenementPayload,
  Evenement,
  EvenementFilters,
  UpdateEvenementPayload,
} from '@/features/evenements/types'
import type { ContributionPayment } from '@/features/payments/contributions/types'

export interface EvenementsPage {
  evenements: Evenement[]
  pagination: PaginationMeta
}

export async function getEvenements(filters: EvenementFilters): Promise<EvenementsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<Evenement>>('/admin/evenements/gestion', {
    params: {
      church_id: filters.churchId,
      statut: filters.statut,
      page: filters.page,
      per_page: filters.perPage ?? 20,
    },
  })
  return { evenements: data.data, pagination: data.pagination }
}

export async function getEvenement(uuid: string): Promise<Evenement> {
  const { data } = await httpClient.get<ApiEnvelope<Evenement>>(`/admin/evenements/${uuid}`)
  return data.data
}

function toFormData(payload: object): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue
    if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }
  return formData
}

export async function createEvenement(payload: CreateEvenementPayload): Promise<Evenement> {
  const formData = toFormData(payload)
  const { data } = await httpClient.post<ApiEnvelope<Evenement>>('/admin/evenements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function updateEvenement(
  uuid: string,
  payload: UpdateEvenementPayload,
): Promise<Evenement> {
  if (payload.image) {
    // PUT ne supporte pas multipart/form-data de façon fiable — on utilise le
    // method-spoofing Laravel (POST + _method=PUT) pour l'envoi avec image.
    const formData = toFormData({ ...payload, _method: 'PUT' })
    const { data } = await httpClient.post<ApiEnvelope<Evenement>>(
      `/admin/evenements/${uuid}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data.data
  }

  const { data } = await httpClient.put<ApiEnvelope<Evenement>>(
    `/admin/evenements/${uuid}`,
    payload,
  )
  return data.data
}

export async function publishEvenement(uuid: string): Promise<Evenement> {
  const { data } = await httpClient.post<ApiEnvelope<Evenement>>(
    `/admin/evenements/${uuid}/publish`,
  )
  return data.data
}

export async function cancelScheduledEvenement(uuid: string): Promise<void> {
  await httpClient.post(`/admin/evenements/${uuid}/cancel-scheduled`)
}

export async function terminerEvenement(uuid: string): Promise<Evenement> {
  const { data } = await httpClient.post<ApiEnvelope<Evenement>>(
    `/admin/evenements/${uuid}/terminer`,
  )
  return data.data
}

export async function archiverEvenement(uuid: string): Promise<Evenement> {
  const { data } = await httpClient.post<ApiEnvelope<Evenement>>(
    `/admin/evenements/${uuid}/archiver`,
  )
  return data.data
}

export async function desarchiverEvenement(uuid: string): Promise<Evenement> {
  const { data } = await httpClient.post<ApiEnvelope<Evenement>>(
    `/admin/evenements/${uuid}/desarchiver`,
  )
  return data.data
}

export interface EvenementContributionsPage {
  contributions: ContributionPayment[]
  pagination: PaginationMeta
}

export async function getEvenementContributions(
  uuid: string,
  page: number,
): Promise<EvenementContributionsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<ContributionPayment>>(
    `/admin/evenements/${uuid}/contributions`,
    { params: { page, per_page: 20 } },
  )
  return { contributions: data.data, pagination: data.pagination }
}
