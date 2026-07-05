import { useQuery } from '@tanstack/react-query'

import * as churchesApi from '@/features/churches/api/churchesApi'

export function useChurch(id: number | undefined) {
  return useQuery({
    queryKey: ['churches', 'detail', id] as const,
    queryFn: () => churchesApi.getChurch(id!),
    enabled: id !== undefined,
  })
}
