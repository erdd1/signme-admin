import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as administrateursApi from '@/features/administrateurs/api/administrateursApi'
import { adminsQueryKey } from '@/features/administrateurs/hooks/useAdmins'
import type { AdminPermissionGrant } from '@/features/auth/types'

export function useUpdateAdminPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: AdminPermissionGrant[] }) =>
      administrateursApi.updateAdminPermissions(id, permissions),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminsQueryKey })
    },
  })
}
