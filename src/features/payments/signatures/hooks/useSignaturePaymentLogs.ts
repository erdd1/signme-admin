import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as signaturePaymentsApi from '@/features/payments/signatures/api/signaturePaymentsApi'
import type { SignaturePaymentFilters } from '@/features/payments/signatures/types'

export function useSignaturePaymentLogs(filters: SignaturePaymentFilters) {
  return useQuery({
    queryKey: ['signature-payments', 'logs', filters] as const,
    queryFn: () => signaturePaymentsApi.getSignaturePaymentLogs(filters),
    placeholderData: keepPreviousData,
  })
}
