import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope } from '@/core/api/types'
import {
  ADMIN_ROLE,
  type AuditTrailEntry,
  type AuditTrailResponseData,
  type AuthSession,
  type DeviceSession,
  type DeviceSessionResponseData,
  type EnableMfaResponseData,
  type EnableMfaResult,
  type FailedAttemptEntry,
  type FailedAttemptResponseData,
  type LoginEntry,
  type LoginEntryResponseData,
  type LoginResponseData,
  type MfaStatus,
  type MfaStatusResponseData,
  type SecurityAlertEntry,
  type SecurityAlertResponseData,
  type SecurityLogEntry,
  type SecurityLogResponseData,
} from '@/features/auth/types'

function mapLoginResponseToSession(data: LoginResponseData): AuthSession {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? '',
    mfaSetupRequired: data.mfaSetupRequired,
    user: {
      id: data.id,
      nom: data.nom,
      email: data.email,
      role: ADMIN_ROLE,
      churchId: data.churchId,
      actif: data.actif,
      estDeService: data.est_de_service,
      photoUrl: data.photoUrl,
      church: data.church ?? null,
    },
  }
}

export async function login(params: {
  email: string
  password: string
  otp?: string
  deviceId?: string
}): Promise<AuthSession> {
  const { data } = await httpClient.post<ApiEnvelope<LoginResponseData>>('/admin/auth/login', {
    email: params.email,
    password: params.password,
    otp: params.otp,
    device_id: params.deviceId,
  })
  return mapLoginResponseToSession(data.data)
}

export async function logout(): Promise<void> {
  await httpClient.post('/admin/auth/logout')
}

export async function changePassword(params: {
  currentPassword: string
  password: string
  passwordConfirmation: string
}): Promise<void> {
  await httpClient.post('/admin/auth/change-password', {
    current_password: params.currentPassword,
    password: params.password,
    password_confirmation: params.passwordConfirmation,
  })
}

export async function forgotPassword(email: string): Promise<void> {
  await httpClient.post('/v1/auth/forgot-password', { email })
}

export async function verifyPasswordResetOtp(params: {
  email: string
  otp: string
}): Promise<string> {
  const { data } = await httpClient.post<ApiEnvelope<{ reset_token: string }>>(
    '/v1/auth/verify-password-reset-otp',
    params,
  )
  return data.data.reset_token
}

export async function resendPasswordResetOtp(email: string): Promise<void> {
  await httpClient.post('/v1/auth/resend-password-reset-otp', { email })
}

export async function confirmPasswordReset(params: {
  email: string
  resetToken: string
  password: string
  passwordConfirmation: string
}): Promise<void> {
  await httpClient.post('/v1/auth/confirm-password-reset', {
    email: params.email,
    reset_token: params.resetToken,
    password: params.password,
    password_confirmation: params.passwordConfirmation,
  })
}

export async function enableMfa(): Promise<EnableMfaResult> {
  const { data } = await httpClient.post<ApiEnvelope<EnableMfaResponseData>>(
    '/admin/auth/mfa/enable',
    { type: 'email' },
  )
  return { backupCodes: data.data.backup_codes, message: data.data.message }
}

export async function confirmMfa(otp: string): Promise<void> {
  await httpClient.post('/admin/auth/mfa/confirm', { otp })
}

export async function disableMfa(): Promise<void> {
  await httpClient.post('/admin/auth/mfa/disable')
}

export async function getMfaStatus(): Promise<MfaStatus> {
  const { data } =
    await httpClient.get<ApiEnvelope<MfaStatusResponseData>>('/admin/auth/mfa/status')
  return {
    enabled: data.data.enabled,
    type: data.data.type,
    backupCodesRemaining: data.data.backup_codes_remaining,
  }
}

function mapDevice(d: DeviceSessionResponseData): DeviceSession {
  return {
    id: d.id,
    deviceId: d.device_id,
    name: d.name,
    deviceType: d.device_type,
    ipAddress: d.ip_address,
    country: d.country,
    os: d.os,
    browser: d.browser,
    isTrusted: d.is_trusted,
    lastActivity: d.last_activity,
  }
}

export async function getDevices(): Promise<DeviceSession[]> {
  const { data } =
    await httpClient.get<ApiEnvelope<DeviceSessionResponseData[]>>('/admin/auth/devices')
  return data.data.map(mapDevice)
}

export async function disconnectDevice(id: number): Promise<void> {
  await httpClient.delete(`/admin/auth/devices/${id}`)
}

export async function getSecurityLogs(params?: {
  days?: number
  limit?: number
}): Promise<SecurityLogEntry[]> {
  const { data } = await httpClient.get<ApiEnvelope<SecurityLogResponseData[]>>(
    '/admin/auth/security-logs',
    { params },
  )
  return data.data.map((l) => ({
    id: l.id,
    userId: l.user_id,
    userName: l.user_name,
    action: l.action,
    status: l.status,
    timestamp: l.timestamp,
    ipAddress: l.ip_address,
  }))
}

export async function getSecurityAlerts(params?: {
  hours?: number
  limit?: number
}): Promise<SecurityAlertEntry[]> {
  const { data } = await httpClient.get<ApiEnvelope<SecurityAlertResponseData[]>>(
    '/admin/auth/security-alerts',
    { params },
  )
  return data.data.map((a) => ({
    id: a.id,
    userId: a.user_id,
    userName: a.user_name,
    action: a.action,
    timestamp: a.timestamp,
    ipAddress: a.ip_address,
    details: a.details,
  }))
}

export async function getAuditTrail(params?: {
  days?: number
  limit?: number
}): Promise<AuditTrailEntry[]> {
  const { data } = await httpClient.get<ApiEnvelope<AuditTrailResponseData[]>>(
    '/admin/auth/audit/trail',
    { params },
  )
  return data.data.map((e) => ({
    id: e.id,
    action: e.action,
    status: e.status,
    timestamp: e.timestamp,
    ipAddress: e.ip_address,
    deviceId: e.device_id,
    details: e.details,
  }))
}

export async function getAllLogins(params?: {
  days?: number
  limit?: number
}): Promise<LoginEntry[]> {
  const { data } = await httpClient.get<ApiEnvelope<LoginEntryResponseData[]>>(
    '/admin/auth/audit/all-logins',
    { params },
  )
  return data.data.map((l) => ({
    id: l.id,
    userId: l.user_id,
    userName: l.user_name,
    timestamp: l.timestamp,
    ipAddress: l.ip_address,
    deviceId: l.device_id,
  }))
}

export async function getAllFailedAttempts(params?: {
  days?: number
  limit?: number
}): Promise<FailedAttemptEntry[]> {
  const { data } = await httpClient.get<ApiEnvelope<FailedAttemptResponseData[]>>(
    '/admin/auth/audit/all-attempts',
    { params },
  )
  return data.data.map((a) => ({
    id: a.id,
    userId: a.user_id,
    userName: a.user_name,
    action: a.action,
    timestamp: a.timestamp,
    ipAddress: a.ip_address,
    reason: a.reason,
  }))
}

export async function exportAuditTrail(days?: number): Promise<Blob> {
  const { data } = await httpClient.get<Blob>('/admin/auth/audit/trail/export', {
    params: { days },
    responseType: 'blob',
  })
  return data
}
