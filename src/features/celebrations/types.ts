export const CELEBRATION_KEYS = [
  'anniversaire',
  'nouvel_an',
  'noel',
  'saint_valentin',
  'journee_femme',
  'fete_travail',
  'paques',
  'fete_unite',
  'fete_jeunesse',
] as const

export type CelebrationKey = (typeof CELEBRATION_KEYS)[number]

export interface CelebrationType {
  id: number
  key: CelebrationKey
  label: string
  titre: string
  messageTemplate: string
  dateRuleType: 'fixed' | 'birthday' | 'easter'
  fixedMonth: number | null
  fixedDay: number | null
  genderFilter: 'homme' | 'femme' | null
  animationKey: string
  active: boolean
}

export interface UpdateCelebrationTypePayload {
  titre?: string
  messageTemplate?: string
  active?: boolean
}

export interface Celebration {
  uuid: string
  type: CelebrationKey
  label: string
  titre: string
  message: string
  animationKey: string
  occursOn: string
  isRead: boolean
  readAt: string | null
  userNom: string | null
  churchNom: string | null
}

export interface CelebrationInstanceFilters {
  churchId?: number
  celebrationTypeId?: number
  page?: number
  perPage?: number
}
