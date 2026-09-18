import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as systemeApi from '@/features/systeme/api/systemeApi'

export function useTriggerBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: systemeApi.triggerBackup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['systeme', 'backups'] })
    },
  })
}
