import { useQuery } from '@tanstack/react-query'

import * as reportsApi from '@/features/dashboard/api/reportsApi'

export function useComparisonReport(churchId: number | undefined) {
  return useQuery({
    queryKey: ['dashboard', 'comparison-report', churchId] as const,
    queryFn: () => reportsApi.getComparisonReport(churchId!),
    enabled: churchId !== undefined,
  })
}
