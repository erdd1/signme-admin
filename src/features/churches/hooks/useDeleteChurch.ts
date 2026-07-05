import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as churchesApi from '@/features/churches/api/churchesApi'

export function useDeleteChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: churchesApi.deleteChurch,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['churches'] })
    },
  })
}
