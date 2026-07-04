import { useQuery } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useVilles(churchId: number | undefined) {
  return useQuery({
    queryKey: ['users', 'villes', churchId] as const,
    queryFn: () => usersApi.getVilles(churchId!),
    enabled: churchId !== undefined,
  })
}
