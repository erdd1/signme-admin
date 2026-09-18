import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as administrateursApi from '@/features/administrateurs/api/administrateursApi'
import { adminsQueryKey } from '@/features/administrateurs/hooks/useAdmins'

export function useCreateAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: administrateursApi.createAdmin,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminsQueryKey })
    },
  })
}
