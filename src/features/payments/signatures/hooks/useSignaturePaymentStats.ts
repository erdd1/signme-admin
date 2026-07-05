import { useQuery } from '@tanstack/react-query'

import * as signaturePaymentsApi from '@/features/payments/signatures/api/signaturePaymentsApi'
import type { SignaturePaymentFilters } from '@/features/payments/signatures/types'

export function useSignaturePaymentStats(
  filters: Pick<SignaturePaymentFilters, 'churchId' | 'startDate' | 'endDate'>,
) {
  return useQuery({
    queryKey: ['signature-payments', 'stats', filters] as const,
    queryFn: () => signaturePaymentsApi.getSignaturePaymentStats(filters),
  })
}
