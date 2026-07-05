import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as churchesApi from '@/features/churches/api/churchesApi'
import type { ChurchFilters } from '@/features/churches/types'

export function churchesQueryKey(filters: ChurchFilters) {
  return ['churches', 'list', filters] as const
}

export function useChurches(filters: ChurchFilters) {
  return useQuery({
    queryKey: churchesQueryKey(filters),
    queryFn: () => churchesApi.getChurches(filters),
    placeholderData: keepPreviousData,
  })
}
