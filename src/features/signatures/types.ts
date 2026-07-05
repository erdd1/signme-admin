export const SIGNATURE_TYPES = ['presentiel', 'distance'] as const
export type SignatureType = (typeof SIGNATURE_TYPES)[number]

export const SIGNATURE_STATUSES = ['pending', 'completed', 'failed'] as const
export type SignatureStatus = (typeof SIGNATURE_STATUSES)[number]

export interface SignatureUserRef {
  id: number
  nom: string
  email: string
  photoUrl: string | null
}

export interface SignatureAncienRef {
  id: number
  nom: string
}

export interface Signature {
  id: number
  userId: number
  nomParoissien: string
  churchId: number
  monthIndex: number
  month: string
  year: number
  amount: number
  fees: number
  paymentMethod: string | null
  phoneNumber: string | null
  signatureType: SignatureType
  status: SignatureStatus
  ancienId: number | null
  ancienNom: string | null
  paymentReference: string | null
  user: SignatureUserRef | null
  ancien: SignatureAncienRef | null
  createdAt: string
  updatedAt: string
}

/** Forme brute renvoyée par l'API (pas de Resource — toArray() du modèle) */
export interface SignatureResponseData {
  id: number
  userId: number
  nomParoissien: string
  churchId: number
  monthIndex: number
  month: string
  year: number
  amount: number
  fees: number
  paymentMethod: string | null
  phoneNumber: string | null
  signatureType: string
  status: string
  ancienId: number | null
  ancienNom: string | null
  payment_reference: string | null
  user?: SignatureUserRef | null
  ancien?: SignatureAncienRef | null
  created_at: string
  updated_at: string
}

export interface SignatureFilters {
  churchId?: number
  month?: string
  year?: number
  type?: SignatureType
  status?: SignatureStatus
  search?: string
  page?: number
  perPage?: number
}

export interface CreateSignaturesPayload {
  userId: number
  months: string[]
  amount: number
}

export interface UpdateSignaturePayload {
  status?: SignatureStatus
  amount?: number
  fees?: number
}
