import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as celebrationsApi from '../api/celebrationsApi'

export function useDeleteCelebration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: celebrationsApi.deleteCelebration,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['celebrations'] })
    },
  })
}
