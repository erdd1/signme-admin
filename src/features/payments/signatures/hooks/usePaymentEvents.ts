import { useQuery } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function usePaymentEvents(transactionId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['payment-events', 'signature', transactionId] as const,
    queryFn: () => paymentActionsApi.getPaymentEvents(transactionId!, 1),
    enabled: enabled && transactionId !== undefined,
  })
}
