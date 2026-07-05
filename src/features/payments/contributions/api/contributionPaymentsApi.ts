import { httpClient } from '@/core/api/httpClient'
import type { PaginatedEnvelope, PaginationMeta } from '@/core/api/types'
import type { ContributionPayment } from '@/features/payments/contributions/types'

export interface ContributionPaymentsPage {
  contributions: ContributionPayment[]
  pagination: PaginationMeta
}

export async function getContributionPayments(
  page: number,
  perPage = 100,
): Promise<ContributionPaymentsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<ContributionPayment>>(
    '/admin/contributions-evenements',
    { params: { page, per_page: perPage } },
  )
  return { contributions: data.data, pagination: data.pagination }
}
