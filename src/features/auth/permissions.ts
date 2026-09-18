import { useAuthStore } from '@/features/auth/store/authStore'
import type { AdminResourceKey, AuthUser } from '@/features/auth/types'

export type AdminAction = 'view' | 'create' | 'update' | 'delete'

/**
 * Un super admin a toujours accès à tout. Un mini-admin n'a accès à un
 * module que si une permission explicite existe pour ce module et cette
 * action — miroir exact de User::hasPermission() côté backend.
 */
export function hasPermission(
  user: AuthUser | null,
  resource: AdminResourceKey,
  action: AdminAction,
): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true

  const grant = user.permissions.find((p) => p.resource === resource)
  if (!grant) return false

  return {
    view: grant.can_view,
    create: grant.can_create,
    update: grant.can_update,
    delete: grant.can_delete,
  }[action]
}

export function useHasPermission(
  resource: AdminResourceKey,
  action: AdminAction = 'view',
): boolean {
  return useAuthStore((state) => hasPermission(state.user, resource, action))
}

export function useIsSuperAdmin(): boolean {
  return useAuthStore((state) => state.user?.isSuperAdmin ?? false)
}
