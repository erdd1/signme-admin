import { useQuery } from '@tanstack/react-query'

import * as reportsApi from '@/features/dashboard/api/reportsApi'

export function useAnnualFinanceReport(year: number, churchId: number | undefined) {
  return useQuery({
    queryKey: ['dashboard', 'annual-finance-report', year, churchId] as const,
    queryFn: () => reportsApi.getAnnualFinanceReport(year, churchId!),
    enabled: churchId !== undefined,
  })
}
