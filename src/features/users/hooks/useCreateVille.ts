import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useCreateVille() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.createVille,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'villes'] })
    },
  })
}
