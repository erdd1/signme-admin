import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as authApi from '@/features/auth/api/authApi'

export const mfaStatusQueryKey = ['auth', 'mfa-status'] as const

export function useMfaStatus() {
  return useQuery({ queryKey: mfaStatusQueryKey, queryFn: authApi.getMfaStatus })
}

export function useEnableMfa() {
  return useMutation({ mutationFn: authApi.enableMfa })
}

export function useConfirmMfa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.confirmMfa,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mfaStatusQueryKey })
    },
  })
}

export function useDisableMfa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.disableMfa,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mfaStatusQueryKey })
    },
  })
}
