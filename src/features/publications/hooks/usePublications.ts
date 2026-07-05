import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as publicationsApi from '@/features/publications/api/publicationsApi'
import type { PublicationFilters } from '@/features/publications/types'

export function publicationsQueryKey(filters: PublicationFilters) {
  return ['publications', 'list', filters] as const
}

export function usePublications(filters: PublicationFilters) {
  return useQuery({
    queryKey: publicationsQueryKey(filters),
    queryFn: () => publicationsApi.getPublications(filters),
    placeholderData: keepPreviousData,
  })
}
