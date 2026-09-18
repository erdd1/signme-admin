import { Navigate, Outlet } from 'react-router'

import { useIsSuperAdmin } from '@/features/auth/permissions'

/**
 * Reflète côté client la règle déjà appliquée par le backend (middleware
 * `super.admin`) : Système et Administrateurs ne sont jamais accordables à
 * un mini-admin, quelles que soient ses permissions. Redirige vers le
 * tableau de bord plutôt que /login — l'utilisateur est authentifié, il lui
 * manque seulement ce privilège précis.
 */
export function SuperAdminGuard() {
  const isSuperAdmin = useIsSuperAdmin()

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
