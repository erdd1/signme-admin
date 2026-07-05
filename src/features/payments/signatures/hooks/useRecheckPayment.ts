import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function useRecheckPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: paymentActionsApi.recheckPayment,
    onSuccess: (_data, transactionId) => {
      void queryClient.invalidateQueries({ queryKey: ['signature-payments'] })
      void queryClient.invalidateQueries({
        queryKey: ['payment-detail', 'signature', transactionId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['payment-events', 'signature', transactionId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['payment-sync-logs', 'signature', transactionId],
      })
    },
  })
}
