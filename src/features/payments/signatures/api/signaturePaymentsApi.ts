import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, LaravelPageEnvelope, PaginationMeta } from '@/core/api/types'
import type {
  SignaturePaymentFilters,
  SignaturePaymentLog,
  SignaturePaymentLogResponseData,
  SignaturePaymentStats,
  SignaturePaymentStatsResponseData,
  UserSignatureHistory,
  UserSignatureHistoryResponseData,
} from '@/features/payments/signatures/types'

function mapLog(l: SignaturePaymentLogResponseData): SignaturePaymentLog {
  return {
    id: l.id,
    userId: l.userId,
    churchId: l.churchId,
    months: l.months,
    amountPerMonth: l.amountPerMonth,
    totalAmount: l.totalAmount,
    fees: l.fees,
    paymentMethod: l.paymentMethod,
    phoneNumber: l.phoneNumber,
    signatureType: l.signatureType as SignaturePaymentLog['signatureType'],
    status: l.status as SignaturePaymentLog['status'],
    paymentReference: l.payment_reference,
    transactionId: l.transaction_id,
    ancienId: l.ancienId,
    ancienNom: l.ancienNom,
    errorMessage: l.errorMessage,
    createdAt: l.created_at,
  }
}

export interface SignaturePaymentLogsPage {
  logs: SignaturePaymentLog[]
  pagination: PaginationMeta
}

export async function getSignaturePaymentLogs(
  filters: SignaturePaymentFilters,
): Promise<SignaturePaymentLogsPage> {
  const { data } = await httpClient.get<LaravelPageEnvelope<SignaturePaymentLogResponseData>>(
    '/admin/signature-logs',
    {
      params: {
        userId: filters.userId,
        churchId: filters.churchId,
        status: filters.status,
        signatureType: filters.signatureType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page,
        per_page: filters.perPage ?? 20,
      },
    },
  )
  return {
    logs: data.data.data.map(mapLog),
    pagination: {
      current_page: data.data.current_page,
      last_page: data.data.last_page,
      per_page: data.data.per_page,
      total: data.data.total,
      from: data.data.from,
      to: data.data.to,
    },
  }
}

export async function getSignaturePaymentStats(
  filters: Pick<SignaturePaymentFilters, 'churchId' | 'startDate' | 'endDate'>,
): Promise<SignaturePaymentStats> {
  const { data } = await httpClient.get<ApiEnvelope<SignaturePaymentStatsResponseData>>(
    '/admin/signature-logs/stats',
    { params: filters },
  )
  return {
    totalAttempts: data.data.total_attempts,
    completed: data.data.completed,
    pending: data.data.pending,
    failed: data.data.failed,
    totalAmount: Number(data.data.total_amount),
    totalFees: Number(data.data.total_fees),
    byType: data.data.by_type,
    byMethod: data.data.by_method,
  }
}

export async function getUserSignatureHistory(userId: number): Promise<UserSignatureHistory> {
  const { data } = await httpClient.get<ApiEnvelope<UserSignatureHistoryResponseData>>(
    `/admin/signature-logs/user/${userId}`,
  )
  return {
    userId: data.data.user_id,
    stats: data.data.stats,
    logs: data.data.logs.map(mapLog),
  }
}
