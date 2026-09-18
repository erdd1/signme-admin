import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { LogsFilters } from '@/features/systeme/api/systemeApi'
import * as systemeApi from '@/features/systeme/api/systemeApi'

export function useLogs(filters: LogsFilters) {
  return useQuery({
    queryKey: ['systeme', 'logs', filters] as const,
    queryFn: () => systemeApi.getLogs(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  })
}
