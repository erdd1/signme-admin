import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as api from '@/features/anciens-designations/api/anciensDesignationsApi'

export function useRetirerDesignation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.retirerDesignation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['anciens-designations'] })
    },
  })
}
