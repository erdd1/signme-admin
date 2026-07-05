import { useQuery } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function usePaymentDetail(transactionId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['payment-detail', 'signature', transactionId] as const,
    queryFn: () => paymentActionsApi.getPaymentDetail(transactionId!),
    enabled: enabled && transactionId !== undefined,
  })
}
