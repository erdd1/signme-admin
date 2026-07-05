import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as evenementsApi from '@/features/evenements/api/evenementsApi'
import type { UpdateEvenementPayload } from '@/features/evenements/types'

export function useUpdateEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: UpdateEvenementPayload }) =>
      evenementsApi.updateEvenement(uuid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evenements'] })
    },
  })
}
