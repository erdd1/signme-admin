import type { AdminPermissionGrant, AdminResourceKey } from '@/features/auth/types'

export interface AdminAccount {
  id: number
  nom: string
  email: string
  actif: boolean
  isSuperAdmin: boolean
  createdAt: string
  permissions: AdminPermissionGrant[]
}

export interface AdminResourceOption {
  key: AdminResourceKey
  label: string
}
