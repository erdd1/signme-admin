import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as sortiesApi from '../api/sortiesApi'

export function useApproveSortie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sortiesApi.approveSortie,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sorties'] })
    },
  })
}
