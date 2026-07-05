import { useQuery } from '@tanstack/react-query'

import * as publicationsApi from '@/features/publications/api/publicationsApi'

export function usePublication(id: number | undefined) {
  return useQuery({
    queryKey: ['publications', 'detail', id] as const,
    queryFn: () => publicationsApi.getPublication(id!),
    enabled: id !== undefined,
  })
}
