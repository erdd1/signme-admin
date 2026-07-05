import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function useRecheckContribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: paymentActionsApi.recheckContribution,
    onSuccess: (_data, uuid) => {
      void queryClient.invalidateQueries({ queryKey: ['contribution-payments'] })
      void queryClient.invalidateQueries({ queryKey: ['payment-detail', 'contribution', uuid] })
      void queryClient.invalidateQueries({ queryKey: ['payment-events', 'contribution', uuid] })
      void queryClient.invalidateQueries({
        queryKey: ['payment-sync-logs', 'contribution', uuid],
      })
    },
  })
}
