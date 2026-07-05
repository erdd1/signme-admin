import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as publicationsApi from '@/features/publications/api/publicationsApi'
import type { UpdatePublicationPayload } from '@/features/publications/types'

export function useUpdatePublication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePublicationPayload }) =>
      publicationsApi.updatePublication(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })
}
