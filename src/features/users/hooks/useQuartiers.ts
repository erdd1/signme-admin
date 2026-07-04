import { useQuery } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useQuartiers(churchId: number | undefined) {
  return useQuery({
    queryKey: ['users', 'quartiers', churchId] as const,
    queryFn: () => usersApi.getQuartiers(churchId!),
    enabled: churchId !== undefined,
  })
}
