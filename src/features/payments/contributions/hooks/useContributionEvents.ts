import { useQuery } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function useContributionEvents(uuid: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['payment-events', 'contribution', uuid] as const,
    queryFn: () => paymentActionsApi.getContributionEvents(uuid!, 1),
    enabled: enabled && uuid !== undefined,
  })
}
