import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as publicationsApi from '@/features/publications/api/publicationsApi'

export function useCreatePublication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publicationsApi.createPublication,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })
}
