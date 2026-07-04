import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'
import type { UserFilters } from '@/features/users/types'

export function usersQueryKey(filters: UserFilters) {
  return ['users', 'list', filters] as const
}

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: usersQueryKey(filters),
    queryFn: () => usersApi.getUsers(filters),
    placeholderData: keepPreviousData,
  })
}
