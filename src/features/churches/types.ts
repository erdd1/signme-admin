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

/** Forme brute renvoyée par GET /admin/churches (index) */
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

export interface ChurchStats {
  totalMembres: number
  totalAnciens: number
  totalParoissiens: number
  signaturesMoisCourant: number
}

export interface ChurchDetail extends Church {
  stats: ChurchStats
}

/** Forme brute renvoyée par GET /admin/churches/{id} (toArray() du modèle + stats imbriquées) */
export interface ChurchDetailResponseData extends ChurchResponseData {
  stats: {
    total_membres: number
    total_anciens: number
    total_paroissiens: number
    signatures_mois_courant: number
  }
}

export interface ChurchFilters {
  search?: string
  page?: number
  perPage?: number
}

export interface CreateChurchPayload {
  nom: string
  ville: string
  region?: string
  adresse?: string
  telephone?: string
  email?: string
}

export interface UpdateChurchPayload {
  nom: string
  ville: string
  region?: string
  adresse?: string
  telephone?: string
  email?: string
}

export interface PastorCandidate {
  id: number
  nom: string
  email: string
  churchId: number | null
  churchNom: string | null
}
