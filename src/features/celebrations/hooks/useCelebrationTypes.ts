import { useQuery } from '@tanstack/react-query'

import * as celebrationsApi from '../api/celebrationsApi'

export const celebrationTypesQueryKey = ['celebration-types'] as const

export function useCelebrationTypes() {
  return useQuery({
    queryKey: celebrationTypesQueryKey,
    queryFn: celebrationsApi.getCelebrationTypes,
  })
}
