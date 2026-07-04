import { Navigate, Outlet } from 'react-router'

import { useAuthStore } from '@/features/auth/store/authStore'
import { ADMIN_ROLE } from '@/features/auth/types'

/**
 * Garde-fou simple : le backend restreint déjà `/api/admin/*` au rôle
 * `administrateur` (middleware `role:administrateur`). Ce guard ne fait que
 * refléter côté client cette unique règle d'accès — ce n'est pas un système
 * de permissions du dashboard (la gestion des rôles pasteur/secrétaire/
 * trésorier/ancien/paroissien se fait depuis le futur module Utilisateurs).
 */
export function RoleGuard() {
  const role = useAuthStore((state) => state.user?.role)

  if (role !== ADMIN_ROLE) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
