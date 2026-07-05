import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'

export function useEvenementContributions(uuid: string | undefined, page: number) {
  return useQuery({
    queryKey: ['evenements', 'contributions', uuid, page] as const,
    queryFn: () => evenementsApi.getEvenementContributions(uuid!, page),
    enabled: uuid !== undefined,
    placeholderData: keepPreviousData,
  })
}
