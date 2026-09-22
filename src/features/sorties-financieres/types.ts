export const SORTIE_TYPES = ['simple', 'frais'] as const
export const SORTIE_STATUTS = ['pending', 'approved', 'rejected'] as const

export type SortieType = (typeof SORTIE_TYPES)[number]
export type SortieStatut = (typeof SORTIE_STATUTS)[number]

export interface SortieFinanciere {
  uuid: string
  type: SortieType
  statut: SortieStatut
  montant: number
  description: string
  reference: string | null
  motifRejet: string | null
  soldeApres: number | null
  auteur: { id: number; nom: string }
  validatedBy: { id: number; nom: string } | null
  validatedAt: string | null
  createdAt: string
  church?: { id: number; nom: string }
}

export interface SortiesFilters {
  churchId?: number
  type?: SortieType
  statut?: SortieStatut
  page?: number
  perPage?: number
}
