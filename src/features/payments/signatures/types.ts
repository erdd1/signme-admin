export const SIGNATURE_PAYMENT_STATUSES = ['pending', 'completed', 'failed'] as const
export type SignaturePaymentStatus = (typeof SIGNATURE_PAYMENT_STATUSES)[number]

export const SIGNATURE_TYPES = ['presentiel', 'distance'] as const
export type SignatureType = (typeof SIGNATURE_TYPES)[number]

export interface SignaturePaymentLog {
  id: number
  userId: number
  churchId: number
  months: string[]
  amountPerMonth: number
  totalAmount: number
  fees: number
  paymentMethod: string
  phoneNumber: string | null
  signatureType: SignatureType
  status: SignaturePaymentStatus
  paymentReference: string | null
  transactionId: number | null
  ancienId: number | null
  ancienNom: string | null
  errorMessage: string | null
  createdAt: string
}

/** Forme brute renvoyée par GET /admin/signature-logs (et /{id}, /user/{userId}) */
export interface SignaturePaymentLogResponseData {
  id: number
  userId: number
  churchId: number
  months: string[]
  amountPerMonth: number
  totalAmount: number
  fees: number
  paymentMethod: string
  phoneNumber: string | null
  signatureType: string
  status: string
  payment_reference: string | null
  transaction_id: number | null
  ancienId: number | null
  ancienNom: string | null
  errorMessage: string | null
  created_at: string
}

export interface SignaturePaymentFilters {
  userId?: number
  churchId?: number
  status?: SignaturePaymentStatus
  signatureType?: SignatureType
  startDate?: string
  endDate?: string
  page?: number
  perPage?: number
}

export interface SignaturePaymentStats {
  totalAttempts: number
  completed: number
  pending: number
  failed: number
  totalAmount: number
  totalFees: number
  byType: { presentiel: number; distance: number }
  byMethod: Record<string, number>
}

/** Forme brute renvoyée par GET /admin/signature-logs/stats (montants en string) */
export interface SignaturePaymentStatsResponseData {
  total_attempts: number
  completed: number
  pending: number
  failed: number
  total_amount: string
  total_fees: string
  by_type: { presentiel: number; distance: number }
  by_method: Record<string, number>
}

export interface UserSignatureHistory {
  userId: number
  stats: { total: number; completed: number; pending: number; failed: number }
  logs: SignaturePaymentLog[]
}

/** Forme brute renvoyée par GET /admin/signature-logs/user/{userId} */
export interface UserSignatureHistoryResponseData {
  user_id: number
  stats: { total: number; completed: number; pending: number; failed: number }
  logs: SignaturePaymentLogResponseData[]
}
