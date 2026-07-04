import { useMutation } from '@tanstack/react-query'

import * as authApi from '@/features/auth/api/authApi'

export function useLogin() {
  return useMutation({ mutationFn: authApi.login })
}

export function useLogout() {
  return useMutation({ mutationFn: authApi.logout })
}
