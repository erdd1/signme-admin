export interface MemberSignatureSummary {
  amount: number
  fees: number
  signatureType: 'presentiel' | 'distance'
  paymentMethod: string | null
}

export interface MemberReportEntry {
  id: number
  nom: string
  email: string
  role: string
  photoUrl: string | null
  signed: boolean
  signature?: MemberSignatureSummary
}

export interface SecretaryReport {
  month: string
  churchId: number
  totalMembres: number
  totalSignes: number
  totalNonSignes: number
  tauxSignature: number
  montantCollecte: number
  signes: MemberReportEntry[]
  nonSignes: MemberReportEntry[]
}

/** Forme brute renvoyée par GET /admin/rapports/secretaire */
export interface SecretaryReportResponseData {
  month: string
  eglise_id: number
  total_membres: number
  total_signes: number
  total_non_signes: number
  taux_signature: number
  montant_collecte: number
  signes: MemberReportResponseEntry[]
  non_signes: MemberReportResponseEntry[]
}

export interface MemberReportResponseEntry {
  id: number
  nom: string
  email: string
  role: string
  photoUrl: string | null
  signed: boolean
  signature?: {
    amount: number
    fees: number
    signatureType: string
    paymentMethod: string | null
  }
}

export interface MonthlyFinance {
  monthIndex: number
  monthName: string
  month: string
  nbSignatures: number
  totalOffrandes: number
  totalFrais: number
  totalEncaisse: number
  montantPresentiel: number
  montantDistance: number
  nbPresentiel: number
  nbDistance: number
}

export interface AnnualFinanceReport {
  year: number
  churchId: number
  mois: MonthlyFinance[]
  totauxAnnuels: {
    nbSignatures: number
    totalOffrandes: number
    totalFrais: number
    totalEncaisse: number
  }
}

/** Forme brute renvoyée par GET /admin/rapports/finances/annuel */
export interface AnnualFinanceReportResponseData {
  year: number
  eglise_id: number
  mois: {
    monthIndex: number
    monthName: string
    month: string
    nb_signatures: number
    total_offrandes: number
    total_frais: number
    total_encaisse: number
    montant_presentiel: number
    montant_distance: number
    nb_presentiel: number
    nb_distance: number
  }[]
  totaux_annuels: {
    nb_signatures: number
    total_offrandes: number
    total_frais: number
    total_encaisse: number
  }
}

export interface YearTotals {
  year: number
  nb: number
  total: number
  frais: number
  encaisse: number
}

export interface ComparisonReport {
  churchId: number
  current: YearTotals
  previous: YearTotals
  evolutionPourcentage: number
  evolutionSens: 'hausse' | 'baisse' | 'stable'
  evolutionDifference: number
}

/** Forme brute renvoyée par GET /admin/rapports/comparaison */
export interface ComparisonReportResponseData {
  eglise_id: number
  current: YearTotals
  previous: YearTotals
  evolution: {
    pourcentage: number
    sens: string
    difference: number
  }
}
