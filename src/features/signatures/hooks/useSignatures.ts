import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as signaturesApi from '@/features/signatures/api/signaturesApi'
import type { SignatureFilters } from '@/features/signatures/types'

export function signaturesQueryKey(filters: SignatureFilters) {
  return ['signatures', 'list', filters] as const
}

export function useSignatures(filters: SignatureFilters) {
  return useQuery({
    queryKey: signaturesQueryKey(filters),
    queryFn: () => signaturesApi.getSignatures(filters),
    placeholderData: keepPreviousData,
  })
}
