import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as churchesApi from '@/features/churches/api/churchesApi'

export function useAssignPastor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ churchId, pastorId }: { churchId: number; pastorId: number }) =>
      churchesApi.assignPastor(churchId, pastorId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['churches'] })
    },
  })
}
