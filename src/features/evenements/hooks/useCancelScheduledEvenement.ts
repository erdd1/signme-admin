import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'

export function useCancelScheduledEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evenementsApi.cancelScheduledEvenement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evenements'] })
    },
  })
}
