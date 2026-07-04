import { useMutation } from '@tanstack/react-query'

import * as authApi from '@/features/auth/api/authApi'

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword })
}
