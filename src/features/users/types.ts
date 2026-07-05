export const ROLES = [
  'administrateur',
  'pasteur',
  'secretaire',
  'tresorier',
  'ancien',
  'paroissien',
] as const
export type Role = (typeof ROLES)[number]

export const SEXES = ['homme', 'femme'] as const
export type Sexe = (typeof SEXES)[number]

export const REGIONS = [
  'Adamaoua',
  'Centre',
  'Est',
  'Extrême-Nord',
  'Littoral',
  'Nord',
  'Nord-Ouest',
  'Ouest',
  'Sud',
  'Sud-Ouest',
] as const
export type Region = (typeof REGIONS)[number]

export interface ChurchRef {
  id: number
  nom: string
  ville: string
}

export interface QuartierRef {
  id: number
  nom: string
}

export interface VilleRef {
  id: number
  nom: string
  estDiaspora: boolean
}

export interface GroupeRef {
  id: number
  nom: string
}

/** Forme complète d'un Quartier (au-delà du QuartierRef minimal des dropdowns) */
export interface Quartier {
  id: number
  uuid: string
  nom: string
  churchId: number
  createdBy: number | null
  createdAt: string
  updatedAt: string
}

/** Forme brute renvoyée par GET /admin/quartiers */
export interface QuartierResponseData {
  id: number
  uuid: string
  nom: string
  churchId: number
  createdBy: number | null
  created_at: string
  updated_at: string
}

export type Groupe = Quartier
export type GroupeResponseData = QuartierResponseData

export interface Ville extends Quartier {
  estDiaspora: boolean
}

export interface VilleResponseData extends QuartierResponseData {
  estDiaspora: boolean
}

export interface CreateQuartierPayload {
  nom: string
  churchId: number
}

export type CreateGroupePayload = CreateQuartierPayload

export interface CreateVillePayload {
  nom: string
  estDiaspora: boolean
  churchId: number
}

export interface User {
  id: number
  nom: string
  email: string
  role: Role
  churchId: number | null
  actif: boolean
  estDeService: boolean
  photoUrl: string | null
  telephone: string | null
  profession: string | null
  originaireDe: Region | null
  dateConfirmation: string | null
  lieuConfirmation: string | null
  sexe: Sexe | null
  dateNaissance: string | null
  quartier: QuartierRef | null
  ville: VilleRef | null
  groupePrincipal: GroupeRef | null
  groupes: GroupeRef[]
  church: ChurchRef | null
  createdAt: string | null
  updatedAt: string | null
}

/** Forme brute renvoyée par l'API (UserResource) */
export interface UserResponseData {
  id: number
  nom: string
  email: string
  role: string
  churchId: number | null
  actif: boolean
  est_de_service: boolean
  photoUrl: string | null
  telephone: string | null
  profession: string | null
  originaireDe: string | null
  dateConfirmation: string | null
  lieuConfirmation: string | null
  sexe: string | null
  dateNaissance: string | null
  quartier: QuartierRef | null
  ville: VilleRef | null
  groupePrincipal: GroupeRef | null
  groupes: GroupeRef[]
  church: ChurchRef | null
  created_at: string | null
  updated_at: string | null
}

export interface Church {
  id: number
  nom: string
  ville: string
  region: string | null
  adresse: string | null
  telephone: string | null
  email: string | null
  pastorId: number | null
  pastorNom: string | null
  totalMembres: number
}

/** Forme brute renvoyée par GET /admin/churches */
export interface ChurchResponseData {
  id: number
  nom: string
  ville: string
  region: string | null
  adresse: string | null
  telephone: string | null
  email: string | null
  pastorId: number | null
  pastorNom: string | null
  total_membres: number
}

export interface UserFilters {
  search?: string
  role?: Role
  actif?: boolean
  churchId?: number
  sexe?: Sexe
  originaireDe?: Region
  page?: number
  perPage?: number
}

export interface CreateUserPayload {
  nom: string
  email: string
  password: string
  role: Role
  churchId?: number
  telephone?: string
  profession?: string
  originaireDe?: Region
  sexe?: Sexe
  dateNaissance?: string
  dateConfirmation?: string
  lieuConfirmation?: string
  quartierId?: number
  villeId?: number
  groupeIds?: number[]
  groupePrincipalId?: number
}

export type UpdateUserPayload = Omit<Partial<CreateUserPayload>, 'churchId' | 'password'>
