import { useQuery } from '@tanstack/react-query'

import * as reportsApi from '@/features/dashboard/api/reportsApi'

export function useSecretaryReport(month: string, churchId: number | undefined) {
  return useQuery({
    queryKey: ['dashboard', 'secretary-report', month, churchId] as const,
    queryFn: () => reportsApi.getSecretaryReport(month, churchId!),
    enabled: churchId !== undefined,
  })
}
