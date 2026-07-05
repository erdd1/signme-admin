import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'
import type { PaymentDetail, PaymentEvent, PaymentSyncLog } from '@/features/payments/shared/types'

export interface PaymentEventsPage {
  events: PaymentEvent[]
  pagination: PaginationMeta
}

export interface PaymentSyncLogsPage {
  logs: PaymentSyncLog[]
  pagination: PaginationMeta
}

// ─── Signatures (PaymentTransaction, identifiée par id numérique) ──────────

export async function getPaymentDetail(transactionId: number): Promise<PaymentDetail> {
  const { data } = await httpClient.get<ApiEnvelope<PaymentDetail>>(
    `/admin/payments/${transactionId}/detail`,
  )
  return data.data
}

export async function getPaymentEvents(
  transactionId: number,
  page: number,
): Promise<PaymentEventsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<PaymentEvent>>(
    `/admin/payments/${transactionId}/events`,
    { params: { page } },
  )
  return { events: data.data, pagination: data.pagination }
}

export async function getPaymentSyncLogs(
  transactionId: number,
  page: number,
): Promise<PaymentSyncLogsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<PaymentSyncLog>>(
    `/admin/payments/${transactionId}/sync-logs`,
    { params: { page } },
  )
  return { logs: data.data, pagination: data.pagination }
}

export async function recheckPayment(transactionId: number): Promise<PaymentDetail> {
  const { data } = await httpClient.post<ApiEnvelope<PaymentDetail>>(
    `/admin/payments/${transactionId}/recheck`,
  )
  return data.data
}

export async function getPaymentReceiptBlob(
  transactionId: number,
  download: boolean,
): Promise<Blob> {
  const { data } = await httpClient.get<Blob>(`/admin/payments/${transactionId}/receipt`, {
    params: download ? { download: 1 } : undefined,
    responseType: 'blob',
  })
  return data
}

// ─── Contributions (Contribution, identifiée par uuid) ─────────────────────

export async function getContributionDetail(uuid: string): Promise<PaymentDetail> {
  const { data } = await httpClient.get<ApiEnvelope<PaymentDetail>>(
    `/admin/contributions/${uuid}/detail`,
  )
  return data.data
}

export async function getContributionEvents(
  uuid: string,
  page: number,
): Promise<PaymentEventsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<PaymentEvent>>(
    `/admin/contributions/${uuid}/events`,
    { params: { page } },
  )
  return { events: data.data, pagination: data.pagination }
}

export async function getContributionSyncLogs(
  uuid: string,
  page: number,
): Promise<PaymentSyncLogsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<PaymentSyncLog>>(
    `/admin/contributions/${uuid}/sync-logs`,
    { params: { page } },
  )
  return { logs: data.data, pagination: data.pagination }
}

export async function recheckContribution(uuid: string): Promise<PaymentDetail> {
  const { data } = await httpClient.post<ApiEnvelope<PaymentDetail>>(
    `/admin/contributions/${uuid}/recheck`,
  )
  return data.data
}

export async function getContributionReceiptBlob(uuid: string, download: boolean): Promise<Blob> {
  const { data } = await httpClient.get<Blob>(`/admin/contributions/${uuid}/receipt`, {
    params: download ? { download: 1 } : undefined,
    responseType: 'blob',
  })
  return data
}
