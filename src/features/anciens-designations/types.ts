export interface Disponibilite {
  jours: string
  horaires: string
  resume: string
}

/** Ancien désigné pour le mois/église consulté (sous-objet de GET /admin/anciens-designations) */
export interface AncienDesigne {
  id: number
  nom: string
  photoUrl: string | null
  telephone: string | null
  est_designe: true
  designation_id: number
  /** String JSON brute côté `index` (ex: "[1,2,3]") — préférer `disponibilite.resume`
   *  déjà formaté plutôt que de re-parser ce champ. */
  jours_travail: string | null
  horaire_debut: string | null
  horaire_fin: string | null
  disponibilite: Disponibilite
}

/** Ancien non désigné pour le mois/église consulté */
export interface AncienNonDesigne {
  id: number
  nom: string
  photoUrl: string | null
  telephone: string | null
  est_designe: false
}

/** Réponse brute de GET /admin/anciens-designations (format maison, pas de PaginatedEnvelope) */
export interface AnciensDesignationsData {
  mois: number
  annee: number
  eglise_id: number
  designes: AncienDesigne[]
  non_designes: AncienNonDesigne[]
  total_designes: number
}

export interface AnciensDesignationsFilters {
  mois: number
  annee: number
  churchId?: number
}

/** Body attendu par POST /admin/anciens-designations (DesignerAncienRequest) */
export interface DesignerAncienPayload {
  ancien_id: number
  mois: number
  annee: number
  church_id?: number
  jours_travail?: number[]
  horaire_debut?: string
  horaire_fin?: string
}

/** Réponse brute de POST /admin/anciens-designations — modèle Eloquent, pas de Resource */
export interface AncienDesignationCreated {
  id: number
  ancienId: number
  ancienNom: string
  egliseId: number
  mois: number
  annee: number
  designePar: number
  designeParNom: string
  /** String JSON brute (ex: "[1,2,3]") — le modèle Eloquent la renvoie telle quelle,
   *  pas castée en tableau côté API. */
  jours_travail: string | null
  horaire_debut: string | null
  horaire_fin: string | null
  date_fin_service: string
  created_at: string
  updated_at: string
}

export const JOURS_SEMAINE = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 7, label: 'Dimanche' },
] as const
