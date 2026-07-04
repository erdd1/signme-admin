import { Navigate, Outlet } from 'react-router'

import { useAuthStore } from '@/features/auth/store/authStore'

/** Force la redirection vers /mfa-setup tant que le MFA n'est pas confirmé. */
export function MfaGuard() {
  const mfaSetupRequired = useAuthStore((state) => state.mfaSetupRequired)
  return mfaSetupRequired ? <Navigate to="/mfa-setup" replace /> : <Outlet />
}

/** Empêche d'accéder à /mfa-setup une fois le MFA déjà configuré. */
export function MfaSetupRoute() {
  const mfaSetupRequired = useAuthStore((state) => state.mfaSetupRequired)
  return mfaSetupRequired ? <Outlet /> : <Navigate to="/" replace />
}
