import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'
import type {
  Backup,
  BackupResponseData,
  LogLevel,
  LogsResponseData,
  SystemHealth,
  SystemHealthResponseData,
} from '@/features/systeme/types'

function mapHealth(h: SystemHealthResponseData): SystemHealth {
  return {
    database: {
      status: h.database.status,
      driver: h.database.driver,
      latencyMs: h.database.latency_ms,
      error: h.database.error,
    },
    redis: { status: h.redis.status, latencyMs: h.redis.latency_ms, error: h.redis.error },
    disk: {
      status: h.disk.status,
      freeBytes: h.disk.free_bytes,
      totalBytes: h.disk.total_bytes,
      usedPercent: h.disk.used_percent,
    },
    queue: { status: h.queue.status, failedJobs: h.queue.failed_jobs, error: h.queue.error },
    scheduledJobs: Object.entries(h.scheduled_jobs).map(([name, job]) => ({
      name,
      label: job.label,
      status: job.status,
      lastRunAt: job.last_run_at,
    })),
    checkedAt: h.checked_at,
  }
}

function mapBackup(b: BackupResponseData): Backup {
  return {
    id: b.id,
    uuid: b.uuid,
    filename: b.filename,
    type: b.type,
    status: b.status,
    disks: b.disks ?? [],
    sizeBytes: b.size_bytes,
    errorMessage: b.error_message,
    triggeredByNom: b.triggered_by?.nom ?? null,
    startedAt: b.started_at,
    completedAt: b.completed_at,
    createdAt: b.created_at,
  }
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const { data } =
    await httpClient.get<ApiEnvelope<SystemHealthResponseData>>('/admin/system/health')
  return mapHealth(data.data)
}

export interface BackupsPage {
  backups: Backup[]
  pagination: PaginationMeta
}

export async function getBackups(page: number): Promise<BackupsPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<BackupResponseData>>(
    '/admin/system/backups',
    { params: { page, per_page: 20 } },
  )
  return { backups: data.data.map(mapBackup), pagination: data.pagination }
}

export async function triggerBackup(): Promise<void> {
  await httpClient.post('/admin/system/backups')
}

export async function downloadBackup(uuid: string, filename: string): Promise<void> {
  const { data } = await httpClient.get<Blob>(`/admin/system/backups/${uuid}/download`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function restoreBackup(uuid: string): Promise<void> {
  await httpClient.post(`/admin/system/backups/${uuid}/restore`, { confirm: true })
}

export interface MaintenanceStatus {
  active: boolean
}

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const { data } = await httpClient.get<ApiEnvelope<MaintenanceStatus>>('/admin/system/maintenance')
  return data.data
}

export async function enableMaintenance(): Promise<MaintenanceStatus> {
  const { data } = await httpClient.post<ApiEnvelope<MaintenanceStatus>>(
    '/admin/system/maintenance/enable',
  )
  return data.data
}

export async function disableMaintenance(): Promise<MaintenanceStatus> {
  const { data } = await httpClient.post<ApiEnvelope<MaintenanceStatus>>(
    '/admin/system/maintenance/disable',
  )
  return data.data
}

export interface LogsFilters {
  level?: LogLevel
  search?: string
}

export async function getLogs(filters: LogsFilters): Promise<LogsResponseData> {
  const { data } = await httpClient.get<ApiEnvelope<LogsResponseData>>('/admin/system/logs', {
    params: {
      level: filters.level,
      search: filters.search === '' ? undefined : filters.search,
      limit: 200,
    },
  })
  return data.data
}

export async function downloadLog(): Promise<void> {
  const { data, headers } = await httpClient.get<Blob>('/admin/system/logs/download', {
    responseType: 'blob',
  })
  const disposition = String(headers['content-disposition'] ?? '')
  const match = /filename="?([^"]+)"?/.exec(disposition)
  const filename = match?.[1] ?? 'laravel.log'

  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
