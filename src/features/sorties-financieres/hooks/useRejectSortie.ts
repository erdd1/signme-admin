import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as sortiesApi from '../api/sortiesApi'

export function useRejectSortie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, motif }: { uuid: string; motif: string }) =>
      sortiesApi.rejectSortie(uuid, motif),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sorties'] })
    },
  })
}
