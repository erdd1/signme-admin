import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as churchesApi from '@/features/churches/api/churchesApi'
import type { UpdateChurchPayload } from '@/features/churches/types'

export function useUpdateChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateChurchPayload }) =>
      churchesApi.updateChurch(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['churches'] })
    },
  })
}
