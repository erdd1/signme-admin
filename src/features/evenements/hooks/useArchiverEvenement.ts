import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'

export function useArchiverEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evenementsApi.archiverEvenement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evenements'] })
    },
  })
}
