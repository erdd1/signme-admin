import { useQuery } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useUserStats(churchId: number | undefined) {
  return useQuery({
    queryKey: ['users', 'stats', churchId] as const,
    queryFn: () => usersApi.getUserStats(churchId!),
    enabled: churchId !== undefined,
  })
}
