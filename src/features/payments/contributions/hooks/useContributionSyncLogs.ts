import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function useContributionSyncLogs(uuid: string | undefined, page: number, enabled: boolean) {
  return useQuery({
    queryKey: ['payment-sync-logs', 'contribution', uuid, page] as const,
    queryFn: () => paymentActionsApi.getContributionSyncLogs(uuid!, page),
    enabled: enabled && uuid !== undefined,
    placeholderData: keepPreviousData,
  })
}
