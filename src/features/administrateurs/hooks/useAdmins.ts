import { useQuery } from '@tanstack/react-query'

import * as administrateursApi from '@/features/administrateurs/api/administrateursApi'

export const adminsQueryKey = ['administrateurs', 'list'] as const

export function useAdmins() {
  return useQuery({
    queryKey: adminsQueryKey,
    queryFn: administrateursApi.getAdmins,
  })
}
