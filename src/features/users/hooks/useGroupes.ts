import { useQuery } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useGroupes(churchId: number | undefined) {
  return useQuery({
    queryKey: ['users', 'groupes', churchId] as const,
    queryFn: () => usersApi.getGroupes(churchId!),
    enabled: churchId !== undefined,
  })
}
