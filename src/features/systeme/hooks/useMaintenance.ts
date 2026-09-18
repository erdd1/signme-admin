import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as systemeApi from '@/features/systeme/api/systemeApi'

const maintenanceQueryKey = ['systeme', 'maintenance'] as const

export function useMaintenanceStatus() {
  return useQuery({
    queryKey: maintenanceQueryKey,
    queryFn: systemeApi.getMaintenanceStatus,
  })
}

export function useEnableMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: systemeApi.enableMaintenance,
    onSuccess: (data) => {
      queryClient.setQueryData(maintenanceQueryKey, data)
    },
  })
}

export function useDisableMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: systemeApi.disableMaintenance,
    onSuccess: (data) => {
      queryClient.setQueryData(maintenanceQueryKey, data)
    },
  })
}
