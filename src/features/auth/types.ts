export const ADMIN_ROLE = 'administrateur'

export interface AuthUser {
  id: number
  nom: string
  email: string
  role: typeof ADMIN_ROLE
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
