import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as signaturesApi from '@/features/signatures/api/signaturesApi'

export function useDeleteSignature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signaturesApi.deleteSignature,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['signatures'] })
    },
  })
}
