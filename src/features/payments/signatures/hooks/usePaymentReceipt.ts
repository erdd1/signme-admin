import { useMutation } from '@tanstack/react-query'

import * as paymentActionsApi from '@/features/payments/shared/api/paymentActionsApi'

export function usePaymentReceipt() {
  return useMutation({
    mutationFn: ({ transactionId, download }: { transactionId: number; download: boolean }) =>
      paymentActionsApi.getPaymentReceiptBlob(transactionId, download),
  })
}
