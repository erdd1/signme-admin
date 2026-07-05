import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'

export function useDesarchiverEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evenementsApi.desarchiverEvenement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evenements'] })
    },
  })
}
