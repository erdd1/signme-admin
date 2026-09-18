import { useQuery } from '@tanstack/react-query'

import * as systemeApi from '@/features/systeme/api/systemeApi'

export function useSystemHealth() {
  return useQuery({
    queryKey: ['systeme', 'health'] as const,
    queryFn: systemeApi.getSystemHealth,
    // Rafraîchi automatiquement — cette page reste ouverte pendant les
    // opérations de maintenance, une valeur périmée y est trompeuse.
    refetchInterval: 30_000,
  })
}
