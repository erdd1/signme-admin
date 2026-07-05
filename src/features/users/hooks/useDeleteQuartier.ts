import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useDeleteQuartier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.deleteQuartier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'quartiers'] })
    },
  })
}
