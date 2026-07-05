import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function usePaymentSyncLogs(
  transactionId: number | undefined,
  page: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['payment-sync-logs', 'signature', transactionId, page] as const,
    queryFn: () => paymentActionsApi.getPaymentSyncLogs(transactionId!, page),
    enabled: enabled && transactionId !== undefined,
    placeholderData: keepPreviousData,
  })
}
