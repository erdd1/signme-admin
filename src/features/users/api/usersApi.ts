import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'
import type {
  Church,
  ChurchResponseData,
  CreateUserPayload,
  GroupeRef,
  QuartierRef,
  UpdateUserPayload,
  User,
  UserFilters,
  UserResponseData,
  VilleRef,
} from '@/features/users/types'

function mapUser(u: UserResponseData): User {
  return {
    id: u.id,
    nom: u.nom,
    email: u.email,
    role: u.role as User['role'],
    churchId: u.churchId,
    actif: u.actif,
    estDeService: u.est_de_service,
    photoUrl: u.photoUrl,
    telephone: u.telephone,
    profession: u.profession,
    originaireDe: u.originaireDe as User['originaireDe'],
    dateConfirmation: u.dateConfirmation,
    lieuConfirmation: u.lieuConfirmation,
    sexe: u.sexe as User['sexe'],
    dateNaissance: u.dateNaissance,
    quartier: u.quartier,
    ville: u.ville,
    groupePrincipal: u.groupePrincipal,
    groupes: u.groupes,
    church: u.church,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  }
}

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

export interface UsersPage {
  users: User[]
  pagination: PaginationMeta
}

export async function getUsers(filters: UserFilters): Promise<UsersPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<UserResponseData>>('/admin/users', {
    params: {
      search: filters.search === '' ? undefined : filters.search,
      role: filters.role,
      actif: filters.actif === undefined ? undefined : filters.actif ? 1 : 0,
      church_id: filters.churchId,
      sexe: filters.sexe,
      originaireDe: filters.originaireDe,
      page: filters.page,
      per_page: filters.perPage ?? 20,
    },
  })
  return { users: data.data.map(mapUser), pagination: data.pagination }
}

export async function getUser(id: number): Promise<User> {
  const { data } = await httpClient.get<ApiEnvelope<UserResponseData>>(`/admin/users/${id}`)
  return mapUser(data.data)
}

export interface UserStats {
  churchId: number
  totalFideles: number
  hommes: number
  femmes: number
  auCameroun: number
  horsCameroun: number
}

export async function getUserStats(churchId: number): Promise<UserStats> {
  const { data } = await httpClient.get<
    ApiEnvelope<{
      eglise_id: number
      total_fideles: number
      hommes: number
      femmes: number
      au_cameroun: number
      hors_cameroun: number
    }>
  >('/admin/users/stats', { params: { church_id: churchId } })
  return {
    churchId: data.data.eglise_id,
    totalFideles: data.data.total_fideles,
    hommes: data.data.hommes,
    femmes: data.data.femmes,
    auCameroun: data.data.au_cameroun,
    horsCameroun: data.data.hors_cameroun,
  }
}

function toRequestBody(payload: CreateUserPayload | UpdateUserPayload) {
  return {
    nom: payload.nom,
    email: payload.email,
    password: 'password' in payload ? payload.password : undefined,
    role: payload.role,
    churchId: 'churchId' in payload ? payload.churchId : undefined,
    telephone: payload.telephone,
    profession: payload.profession,
    originaireDe: payload.originaireDe,
    sexe: payload.sexe,
    dateNaissance: payload.dateNaissance,
    dateConfirmation: payload.dateConfirmation,
    lieuConfirmation: payload.lieuConfirmation,
    quartierId: payload.quartierId,
    villeId: payload.villeId,
    groupeIds: payload.groupeIds,
    groupePrincipalId: payload.groupePrincipalId,
  }
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await httpClient.post<ApiEnvelope<UserResponseData>>(
    '/admin/users',
    toRequestBody(payload),
  )
  return mapUser(data.data)
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  const { data } = await httpClient.put<ApiEnvelope<UserResponseData>>(
    `/admin/users/${id}`,
    toRequestBody(payload),
  )
  return mapUser(data.data)
}

export async function deleteUser(id: number): Promise<void> {
  await httpClient.delete(`/admin/users/${id}`)
}

export async function toggleUserStatus(id: number): Promise<void> {
  // Le corps de réponse de cet endpoint n'est pas au format UserResource
  // standard (voir plan) — on ignore les données, l'appelant invalide les
  // queries liste/détail pour récupérer un état à jour et cohérent.
  await httpClient.patch(`/admin/users/${id}/toggle-status`)
}

export async function uploadUserPhoto(id: number, file: File): Promise<string> {
  const formData = new FormData()
  formData.append('photo', file)
  const { data } = await httpClient.post<ApiEnvelope<{ photoUrl: string }>>(
    `/admin/users/${id}/photo`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data.photoUrl
}

export async function getChurches(): Promise<Church[]> {
  const { data } = await httpClient.get<PaginatedEnvelope<ChurchResponseData>>('/admin/churches', {
    params: { per_page: 100 },
  })
  return data.data.map(mapChurch)
}

export async function getQuartiers(churchId: number): Promise<QuartierRef[]> {
  const { data } = await httpClient.get<ApiEnvelope<QuartierRef[]>>('/admin/quartiers', {
    params: { church_id: churchId },
  })
  return data.data
}

export async function getVilles(churchId: number): Promise<VilleRef[]> {
  const { data } = await httpClient.get<ApiEnvelope<VilleRef[]>>('/admin/villes', {
    params: { church_id: churchId },
  })
  return data.data
}

export async function getGroupes(churchId: number): Promise<GroupeRef[]> {
  const { data } = await httpClient.get<ApiEnvelope<GroupeRef[]>>('/admin/groupes', {
    params: { church_id: churchId },
  })
  return data.data
}
