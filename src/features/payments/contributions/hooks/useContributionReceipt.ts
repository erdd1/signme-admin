import { useMutation } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function useContributionReceipt() {
  return useMutation({
    mutationFn: ({ uuid, download }: { uuid: string; download: boolean }) =>
      paymentActionsApi.getContributionReceiptBlob(uuid, download),
  })
}
