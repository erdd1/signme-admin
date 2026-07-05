import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'

export function useDeleteVille() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.deleteVille,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'villes'] })
    },
  })
}
