import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'

export function usePublishEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evenementsApi.publishEvenement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evenements'] })
    },
  })
}
