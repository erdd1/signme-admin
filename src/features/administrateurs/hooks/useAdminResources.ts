import { useQuery } from '@tanstack/react-query'

import * as administrateursApi from '@/features/administrateurs/api/administrateursApi'

export function useAdminResources() {
  return useQuery({
    queryKey: ['administrateurs', 'resources'] as const,
    queryFn: administrateursApi.getAdminResources,
    staleTime: Infinity, // liste fixe côté backend (AdminResourceRegistry), ne change jamais en cours de session
  })
}
