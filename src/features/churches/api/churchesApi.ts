import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'
import type {
  Church,
  ChurchDetail,
  ChurchDetailResponseData,
  ChurchFilters,
  ChurchResponseData,
  CreateChurchPayload,
  PastorCandidate,
  UpdateChurchPayload,
} from '@/features/churches/types'

function mapChurch(c: ChurchResponseData): Church {
  return {
    id: c.id,
    nom: c.nom,
    ville: c.ville,
    region: c.region,
    adresse: c.adresse,
    telephone: c.telephone,
    email: c.email,
    pastorId: c.pastorId,
    pastorNom: c.pastorNom,
    totalMembres: c.total_membres,
  }
}

function mapChurchDetail(c: ChurchDetailResponseData): ChurchDetail {
  return {
    ...mapChurch(c),
    stats: {
      totalMembres: c.stats.total_membres,
      totalAnciens: c.stats.total_anciens,
      totalParoissiens: c.stats.total_paroissiens,
      signaturesMoisCourant: c.stats.signatures_mois_courant,
    },
  }
}

export interface ChurchesPage {
  churches: Church[]
  pagination: PaginationMeta
}

export async function getChurches(filters: ChurchFilters): Promise<ChurchesPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<ChurchResponseData>>('/admin/churches', {
    params: {
      search: filters.search === '' ? undefined : filters.search,
      page: filters.page,
      per_page: filters.perPage ?? 20,
    },
  })
  return { churches: data.data.map(mapChurch), pagination: data.pagination }
}

export async function getChurch(id: number): Promise<ChurchDetail> {
  const { data } = await httpClient.get<ApiEnvelope<ChurchDetailResponseData>>(
    `/admin/churches/${id}`,
  )
  return mapChurchDetail(data.data)
}

export async function createChurch(payload: CreateChurchPayload): Promise<Church> {
  const { data } = await httpClient.post<ApiEnvelope<ChurchResponseData>>('/admin/churches', {
    nom: payload.nom,
    ville: payload.ville,
    region: payload.region,
    adresse: payload.adresse,
    telephone: payload.telephone,
    email: payload.email,
  })
  return mapChurch(data.data)
}

export async function updateChurch(id: number, payload: UpdateChurchPayload): Promise<Church> {
  const { data } = await httpClient.put<ApiEnvelope<ChurchResponseData>>(`/admin/churches/${id}`, {
    nom: payload.nom,
    ville: payload.ville,
    // Un champ optionnel non renseigné dans le formulaire doit vider la
    // valeur existante (null explicite), pas rester inchangé — voir le
    // fix de ChurchService::update() (array_key_exists).
    region: payload.region ?? null,
    adresse: payload.adresse ?? null,
    telephone: payload.telephone ?? null,
    email: payload.email ?? null,
  })
  return mapChurch(data.data)
}

export async function deleteChurch(id: number): Promise<void> {
  await httpClient.delete(`/admin/churches/${id}`)
}

export async function assignPastor(churchId: number, pastorId: number): Promise<Church> {
  const { data } = await httpClient.post<ApiEnvelope<ChurchResponseData>>(
    `/admin/churches/${churchId}/pastor`,
    { pastor_id: pastorId },
  )
  return mapChurch(data.data)
}

interface PastorCandidateResponseData {
  id: number
  nom: string
  email: string
  churchId: number | null
  church: { id: number; nom: string; ville: string } | null
}

export async function getPastorCandidates(): Promise<PastorCandidate[]> {
  const { data } = await httpClient.get<PaginatedEnvelope<PastorCandidateResponseData>>(
    '/admin/users',
    { params: { role: 'pasteur', per_page: 100 } },
  )
  return data.data.map((u) => ({
    id: u.id,
    nom: u.nom,
    email: u.email,
    churchId: u.churchId,
    churchNom: u.church?.nom ?? null,
  }))
}
