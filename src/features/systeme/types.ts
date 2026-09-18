export type ServiceStatus = 'ok' | 'warning' | 'down' | 'unknown'
export type ScheduledJobStatus = 'ok' | 'stale' | 'never_run'

export interface DatabaseHealth {
  status: ServiceStatus
  driver?: string
  latencyMs?: number
  error?: string
}

export interface RedisHealth {
  status: ServiceStatus
  latencyMs?: number
  error?: string
}

export interface DiskHealth {
  status: ServiceStatus
  freeBytes?: number
  totalBytes?: number
  usedPercent?: number
}

export interface QueueHealth {
  status: ServiceStatus
  failedJobs?: number
  error?: string
}

export interface ScheduledJobHealth {
  name: string
  label: string
  status: ScheduledJobStatus
  lastRunAt: string | null
}

export interface SystemHealth {
  database: DatabaseHealth
  redis: RedisHealth
  disk: DiskHealth
  queue: QueueHealth
  scheduledJobs: ScheduledJobHealth[]
  checkedAt: string
}

/** Forme brute renvoyée par GET /admin/system/health */
export interface SystemHealthResponseData {
  database: { status: ServiceStatus; driver?: string; latency_ms?: number; error?: string }
  redis: { status: ServiceStatus; latency_ms?: number; error?: string }
  disk: {
    status: ServiceStatus
    free_bytes?: number
    total_bytes?: number
    used_percent?: number
  }
  queue: { status: ServiceStatus; failed_jobs?: number; error?: string }
  scheduled_jobs: Record<
    string,
    { label: string; status: ScheduledJobStatus; last_run_at: string | null }
  >
  checked_at: string
}

export type BackupType = 'scheduled' | 'manual' | 'pre_restore_safety'
export type BackupStatus = 'pending' | 'success' | 'partial' | 'failed'

export interface Backup {
  id: number
  uuid: string
  filename: string
  type: BackupType
  status: BackupStatus
  disks: string[]
  sizeBytes: number | null
  errorMessage: string | null
  triggeredByNom: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

/**
 * Forme brute renvoyée par GET /admin/system/backups — `triggered_by` est
 * soit `null`, soit l'utilisateur imbriqué (jamais l'id brut) : le nom de la
 * relation Eloquent `triggeredBy()` se snake_case en la même clé que la
 * colonne FK `triggered_by`, qu'il écrase lors de la sérialisation JSON.
 */
export interface BackupResponseData {
  id: number
  uuid: string
  filename: string
  type: BackupType
  status: BackupStatus
  disks: string[] | null
  size_bytes: number | null
  error_message: string | null
  triggered_by: { id: number; nom: string } | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export type LogLevel =
  'emergency' | 'alert' | 'critical' | 'error' | 'warning' | 'notice' | 'info' | 'debug'

export interface LogEntry {
  timestamp: string
  env: string
  level: LogLevel
  message: string
  context: string
}

export interface LogsResponseData {
  entries: LogEntry[]
  levels: LogLevel[]
}
