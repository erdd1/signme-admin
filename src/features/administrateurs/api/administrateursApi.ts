import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope } from '@/core/api/types'
import type { AdminAccount, AdminResourceOption } from '@/features/administrateurs/types'
import type { AdminPermissionGrant } from '@/features/auth/types'

// Le backend renvoie déjà exactement la forme AdminAccount (AdminAccessController::formatAdmin())
// — aucune conversion snake_case/camelCase nécessaire ici.

export async function getAdminResources(): Promise<AdminResourceOption[]> {
  const { data } = await httpClient.get<ApiEnvelope<AdminResourceOption[]>>(
    '/admin/admin-access/resources',
  )
  return data.data
}

export async function getAdmins(): Promise<AdminAccount[]> {
  const { data } = await httpClient.get<ApiEnvelope<AdminAccount[]>>('/admin/admin-access')
  return data.data
}

export interface CreateAdminPayload {
  nom: string
  email: string
  password: string
}

export async function createAdmin(payload: CreateAdminPayload): Promise<AdminAccount> {
  const { data } = await httpClient.post<ApiEnvelope<AdminAccount>>('/admin/admin-access', payload)
  return data.data
}

export async function updateAdminPermissions(
  id: number,
  permissions: AdminPermissionGrant[],
): Promise<AdminAccount> {
  const { data } = await httpClient.put<ApiEnvelope<AdminAccount>>(
    `/admin/admin-access/${id}/permissions`,
    { permissions },
  )
  return data.data
}
