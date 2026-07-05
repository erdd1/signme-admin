import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'
import type { EvenementFilters } from '@/features/evenements/types'

export function evenementsQueryKey(filters: EvenementFilters) {
  return ['evenements', 'list', filters] as const
}

export function useEvenements(filters: EvenementFilters) {
  return useQuery({
    queryKey: evenementsQueryKey(filters),
    queryFn: () => evenementsApi.getEvenements(filters),
    placeholderData: keepPreviousData,
  })
}
