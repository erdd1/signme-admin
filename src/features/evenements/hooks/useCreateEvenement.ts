import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'

export function useCreateEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evenementsApi.createEvenement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evenements'] })
    },
  })
}
