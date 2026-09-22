import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as sortiesApi from '../api/sortiesApi'
import type { SortiesFilters } from '../types'

export function sortiesQueryKey(filters: SortiesFilters) {
  return ['sorties', 'list', filters] as const
}

export function useSortiesFinancieres(filters: SortiesFilters) {
  return useQuery({
    queryKey: sortiesQueryKey(filters),
    queryFn: () => sortiesApi.getSorties(filters),
    placeholderData: keepPreviousData,
  })
}
