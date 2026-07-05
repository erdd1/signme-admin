import { useQuery } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function useContributionDetail(uuid: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['payment-detail', 'contribution', uuid] as const,
    queryFn: () => paymentActionsApi.getContributionDetail(uuid!),
    enabled: enabled && uuid !== undefined,
  })
}
