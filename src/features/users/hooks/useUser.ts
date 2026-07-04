import { useQuery } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useUser(id: number | undefined) {
  return useQuery({
    queryKey: ['users', 'detail', id] as const,
    queryFn: () => usersApi.getUser(id!),
    enabled: id !== undefined,
  })
}
