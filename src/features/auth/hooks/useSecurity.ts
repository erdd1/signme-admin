import { useMutation, useQuery } from '@tanstack/react-query'

import * as authApi from '@/features/auth/api/authApi'

export function useSecurityLogs(params?: { days?: number; limit?: number }) {
  return useQuery({
    queryKey: ['auth', 'security-logs', params],
    queryFn: () => authApi.getSecurityLogs(params),
  })
}

export function useSecurityAlerts(params?: { hours?: number; limit?: number }) {
  return useQuery({
    queryKey: ['auth', 'security-alerts', params],
    queryFn: () => authApi.getSecurityAlerts(params),
  })
}

export function useAuditTrail(params?: { days?: number; limit?: number }) {
  return useQuery({
    queryKey: ['auth', 'audit-trail', params],
    queryFn: () => authApi.getAuditTrail(params),
  })
}

export function useAllLogins(params?: { days?: number; limit?: number }) {
  return useQuery({
    queryKey: ['auth', 'all-logins', params],
    queryFn: () => authApi.getAllLogins(params),
  })
}

export function useAllFailedAttempts(params?: { days?: number; limit?: number }) {
  return useQuery({
    queryKey: ['auth', 'all-attempts', params],
    queryFn: () => authApi.getAllFailedAttempts(params),
  })
}

export function useExportAuditTrail() {
  return useMutation({ mutationFn: authApi.exportAuditTrail })
}
