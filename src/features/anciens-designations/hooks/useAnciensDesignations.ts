import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as api from '@/features/anciens-designations/api/anciensDesignationsApi'
import type { AnciensDesignationsFilters } from '@/features/anciens-designations/types'

export function anciensDesignationsQueryKey(filters: AnciensDesignationsFilters) {
  return ['anciens-designations', 'list', filters] as const
}

export function useAnciensDesignations(filters: AnciensDesignationsFilters) {
  return useQuery({
    queryKey: anciensDesignationsQueryKey(filters),
    queryFn: () => api.getAnciensDesignations(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters.churchId,
  })
}
