import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as celebrationsApi from '../api/celebrationsApi'
import type { UpdateCelebrationTypePayload } from '../types'
import { celebrationTypesQueryKey } from './useCelebrationTypes'

export function useUpdateCelebrationType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCelebrationTypePayload }) =>
      celebrationsApi.updateCelebrationType(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: celebrationTypesQueryKey })
    },
  })
}
