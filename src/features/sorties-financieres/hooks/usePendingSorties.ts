import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as sortiesApi from '../api/sortiesApi'

export function pendingSortiesQueryKey(page: number) {
  return ['sorties', 'pending', page] as const
}

export function usePendingSorties(page = 1) {
  return useQuery({
    queryKey: pendingSortiesQueryKey(page),
    queryFn: () => sortiesApi.getPendingSorties(page),
    placeholderData: keepPreviousData,
  })
}
