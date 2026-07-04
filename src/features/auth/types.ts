export const ADMIN_ROLE = 'administrateur'

export interface ChurchSummary {
  id: number
  nom: string
  ville: string
}

export interface AuthUser {
  id: number
  nom: string
  email: string
  role: typeof ADMIN_ROLE
  churchId: number | null
  actif: boolean
  estDeService: boolean
  photoUrl: string | null
  church: ChurchSummary | null
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
  mfaSetupRequired: boolean
}

/** Forme brute renvoyée par POST /admin/auth/login (AuthEntity::toArray()) */
export interface LoginResponseData {
  id: number
  nom: string
  email: string
  role: string
  actif: boolean
  est_de_service: boolean
  churchId: number | null
  photoUrl: string | null
  access_token: string
  mfaSetupRequired: boolean
  refresh_token?: string
  token_type?: string
  expires_in?: number
  church?: ChurchSummary
}

export interface MfaStatus {
  enabled: boolean
  type: string | null
  backupCodesRemaining: number
}

/** Forme brute renvoyée par GET /admin/auth/mfa/status */
export interface MfaStatusResponseData {
  enabled: boolean
  type: string | null
  backup_codes_remaining: number
}

export interface EnableMfaResult {
  backupCodes: string[]
  message: string
}

/** Forme brute renvoyée par POST /admin/auth/mfa/enable */
export interface EnableMfaResponseData {
  backup_codes: string[]
  message: string
}

export interface DeviceSession {
  id: number
  deviceId: string | null
  name: string
  deviceType: string
  ipAddress: string | null
  country: string | null
  os: string | null
  browser: string | null
  isTrusted: boolean
  lastActivity: string
}

/** Forme brute renvoyée par GET /admin/auth/devices */
export interface DeviceSessionResponseData {
  id: number
  device_id: string | null
  name: string
  device_type: string
  ip_address: string | null
  country: string | null
  os: string | null
  browser: string | null
  is_trusted: boolean
  last_activity: string
}

export interface SecurityLogEntry {
  id: number
  userId: number | null
  userName: string
  action: string
  status: string
  timestamp: string
  ipAddress: string | null
}

/** Forme brute renvoyée par GET /admin/auth/security-logs */
export interface SecurityLogResponseData {
  id: number
  user_id: number | null
  user_name: string
  action: string
  status: string
  timestamp: string
  ip_address: string | null
}

export interface SecurityAlertEntry {
  id: number
  userId: number | null
  userName: string
  action: string
  timestamp: string
  ipAddress: string | null
  details: unknown
}

/** Forme brute renvoyée par GET /admin/auth/security-alerts */
export interface SecurityAlertResponseData {
  id: number
  user_id: number | null
  user_name: string
  action: string
  timestamp: string
  ip_address: string | null
  details: unknown
}

export interface AuditTrailEntry {
  id: number
  action: string
  status: string
  timestamp: string
  ipAddress: string | null
  deviceId: string | null
  details: unknown
}

/** Forme brute renvoyée par GET /admin/auth/audit/trail */
export interface AuditTrailResponseData {
  id: number
  action: string
  status: string
  timestamp: string
  ip_address: string | null
  device_id: string | null
  details: unknown
}

export interface LoginEntry {
  id: number
  userId: number | null
  userName: string
  timestamp: string
  ipAddress: string | null
  deviceId: string | null
}

/** Forme brute renvoyée par GET /admin/auth/audit/all-logins */
export interface LoginEntryResponseData {
  id: number
  user_id: number | null
  user_name: string
  timestamp: string
  ip_address: string | null
  device_id: string | null
}

export interface FailedAttemptEntry {
  id: number
  userId: number | null
  userName: string
  action: string
  timestamp: string
  ipAddress: string | null
  reason: string
}

/** Forme brute renvoyée par GET /admin/auth/audit/all-attempts */
export interface FailedAttemptResponseData {
  id: number
  user_id: number | null
  user_name: string
  action: string
  timestamp: string
  ip_address: string | null
  reason: string
}
