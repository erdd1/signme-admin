import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useCreateQuartier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.createQuartier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'quartiers'] })
    },
  })
}
