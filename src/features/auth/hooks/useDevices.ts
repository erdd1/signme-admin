import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as authApi from '@/features/auth/api/authApi'

export const devicesQueryKey = ['auth', 'devices'] as const

export function useDevices() {
  return useQuery({ queryKey: devicesQueryKey, queryFn: authApi.getDevices })
}

export function useDisconnectDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.disconnectDevice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: devicesQueryKey })
    },
  })
}
