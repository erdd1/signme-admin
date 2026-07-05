import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'

export function useTerminerEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evenementsApi.terminerEvenement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evenements'] })
    },
  })
}
