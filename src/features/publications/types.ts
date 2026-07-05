export const PUBLICATION_TYPES = ['annonce', 'meditation'] as const
export type PublicationType = (typeof PUBLICATION_TYPES)[number]

export interface Publication {
  id: number
  churchId: number
  type: PublicationType
  titre: string
  contenu: string
  referenceBiblique: string | null
  auteurId: number
  auteurNom: string
  auteurPhotoUrl: string | null
  date: string
  createdAt: string
  updatedAt: string
}

/** Forme brute renvoyée par l'API (pas de Resource — toArray() du modèle) */
export interface PublicationResponseData {
  id: number
  churchId: number
  type: string
  titre: string
  contenu: string
  referenceBiblique: string | null
  auteurId: number
  auteurNom: string
  auteurPhotoUrl: string | null
  date: string
  created_at: string
  updated_at: string
}

export interface PublicationFilters {
  type?: PublicationType
  churchId?: number
  page?: number
  perPage?: number
}

export interface CreatePublicationPayload {
  type: PublicationType
  titre: string
  contenu: string
  referenceBiblique?: string
  churchId: number
}

export interface UpdatePublicationPayload {
  titre: string
  contenu: string
  referenceBiblique?: string
}
