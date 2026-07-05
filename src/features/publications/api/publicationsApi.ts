import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'
import type {
  CreatePublicationPayload,
  Publication,
  PublicationFilters,
  PublicationResponseData,
  UpdatePublicationPayload,
} from '@/features/publications/types'

function mapPublication(p: PublicationResponseData): Publication {
  return {
    id: p.id,
    churchId: p.churchId,
    type: p.type as Publication['type'],
    titre: p.titre,
    contenu: p.contenu,
    referenceBiblique: p.referenceBiblique,
    auteurId: p.auteurId,
    auteurNom: p.auteurNom,
    auteurPhotoUrl: p.auteurPhotoUrl,
    date: p.date,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

export interface PublicationsPage {
  publications: Publication[]
  pagination: PaginationMeta
}

export async function getPublications(filters: PublicationFilters): Promise<PublicationsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<PublicationResponseData>>(
    '/admin/publications',
    {
      params: {
        type: filters.type,
        church_id: filters.churchId,
        page: filters.page,
        per_page: filters.perPage ?? 20,
      },
    },
  )
  return { publications: data.data.map(mapPublication), pagination: data.pagination }
}

export async function getPublication(id: number): Promise<Publication> {
  const { data } = await httpClient.get<ApiEnvelope<PublicationResponseData>>(
    `/admin/publications/${id}`,
  )
  return mapPublication(data.data)
}

export async function createPublication(payload: CreatePublicationPayload): Promise<Publication> {
  const { data } = await httpClient.post<ApiEnvelope<PublicationResponseData>>(
    '/admin/publications',
    payload,
  )
  return mapPublication(data.data)
}

export async function updatePublication(
  id: number,
  payload: UpdatePublicationPayload,
): Promise<Publication> {
  const { data } = await httpClient.put<ApiEnvelope<PublicationResponseData>>(
    `/admin/publications/${id}`,
    payload,
  )
  return mapPublication(data.data)
}

export async function deletePublication(id: number): Promise<void> {
  await httpClient.delete(`/admin/publications/${id}`)
}
