import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as systemeApi from '@/features/systeme/api/systemeApi'

export function useRestoreBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: systemeApi.restoreBackup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['systeme', 'backups'] })
      void queryClient.invalidateQueries({ queryKey: ['systeme', 'health'] })
    },
  })
}
