import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as signaturesApi from '@/features/signatures/api/signaturesApi'
import type { UpdateSignaturePayload } from '@/features/signatures/types'

export function useUpdateSignature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSignaturePayload }) =>
      signaturesApi.updateSignature(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['signatures'] })
    },
  })
}
