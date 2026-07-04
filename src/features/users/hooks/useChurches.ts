import { useQuery } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useChurches() {
  return useQuery({
    queryKey: ['users', 'churches'] as const,
    queryFn: usersApi.getChurches,
    staleTime: 5 * 60 * 1000,
  })
}
