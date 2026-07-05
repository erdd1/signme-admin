export const EVENEMENT_STATUTS = ['brouillon', 'planifie', 'actif', 'termine', 'archive'] as const
export type EvenementStatut = (typeof EVENEMENT_STATUTS)[number]

export const EVENEMENT_MODES = ['brouillon', 'immediate', 'planifie'] as const
export type EvenementMode = (typeof EVENEMENT_MODES)[number]

/** Le Resource backend est déjà entièrement camelCase — pas de type "raw"
 * séparé ni de fonction de mapping nécessaire pour ce module. */
export interface Evenement {
  uuid: string
  titre: string
  description: string
  imageUrl: string | null
  statut: EvenementStatut
  dateDebut: string
  dateFin: string | null
  publishedAt: string | null
  scheduledPublishAt: string | null
  termineAt: string | null
  archivedAt: string | null
  objectifMontant: number | null
  montantCollecte: number
  nombreContributions: number
  nombreContributeurs: number | null
  pourcentageObjectif: number | null
  joursAvantArchivage: number | null
  auteur: { id: number; nom: string; photoUrl: string | null }
  church: { id: number; nom: string }
  estAuteur: boolean
  peutContribuer: boolean
  peutGerer: boolean
  createdAt: string
  updatedAt: string
}

export interface EvenementFilters {
  churchId?: number
  statut?: EvenementStatut
  page?: number
  perPage?: number
}

export interface CreateEvenementPayload {
  titre: string
  description: string
  dateDebut: string
  dateFin?: string
  objectifMontant?: number
  mode: EvenementMode
  scheduledPublishAt?: string
  churchId: number
  image?: File
}

export interface UpdateEvenementPayload {
  titre?: string
  description?: string
  dateFin?: string
  objectifMontant?: number
  image?: File
}
