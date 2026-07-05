import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useDeleteGroupe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.deleteGroupe,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'groupes'] })
    },
  })
}
