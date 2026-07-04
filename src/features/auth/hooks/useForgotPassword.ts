import { useMutation } from '@tanstack/react-query'

import * as authApi from '@/features/auth/api/authApi'

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword })
}

export function useVerifyPasswordResetOtp() {
  return useMutation({ mutationFn: authApi.verifyPasswordResetOtp })
}

export function useResendPasswordResetOtp() {
  return useMutation({ mutationFn: authApi.resendPasswordResetOtp })
}

export function useConfirmPasswordReset() {
  return useMutation({ mutationFn: authApi.confirmPasswordReset })
}
