import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as contributionPaymentsApi from '@/features/payments/contributions/api/contributionPaymentsApi'

export function useContributionPayments(page: number) {
  return useQuery({
    queryKey: ['contribution-payments', page] as const,
    queryFn: () => contributionPaymentsApi.getContributionPayments(page),
    placeholderData: keepPreviousData,
  })
}
