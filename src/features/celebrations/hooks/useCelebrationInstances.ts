import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as celebrationsApi from '../api/celebrationsApi'
import type { CelebrationInstanceFilters } from '../types'

export function celebrationInstancesQueryKey(filters: CelebrationInstanceFilters) {
  return ['celebrations', 'list', filters] as const
}

export function useCelebrationInstances(filters: CelebrationInstanceFilters) {
  return useQuery({
    queryKey: celebrationInstancesQueryKey(filters),
    queryFn: () => celebrationsApi.getCelebrations(filters),
    placeholderData: keepPreviousData,
  })
}
