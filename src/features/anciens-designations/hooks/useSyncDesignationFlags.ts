import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as api from '@/features/anciens-designations/api/anciensDesignationsApi'

export function useSyncDesignationFlags() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.syncDesignationFlags,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['anciens-designations'] })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
