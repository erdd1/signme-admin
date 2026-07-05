import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as signaturesApi from '@/features/signatures/api/signaturesApi'

export function useCreateSignatures() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signaturesApi.createSignatures,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['signatures'] })
    },
  })
}
