import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as publicationsApi from '@/features/publications/api/publicationsApi'

export function useDeletePublication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publicationsApi.deletePublication,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })
}
