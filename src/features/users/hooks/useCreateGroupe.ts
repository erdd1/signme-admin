import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useCreateGroupe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.createGroupe,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'groupes'] })
    },
  })
}
