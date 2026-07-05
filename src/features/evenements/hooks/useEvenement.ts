import { useQuery } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'

export function useEvenement(uuid: string | undefined) {
  return useQuery({
    queryKey: ['evenements', 'detail', uuid] as const,
    queryFn: () => evenementsApi.getEvenement(uuid!),
    enabled: uuid !== undefined,
  })
}
