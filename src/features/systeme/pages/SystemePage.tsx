import { Database, Download, HardDrive, ListTodo, Power, RefreshCw, Server } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getApiErrorMessage } from '@/core/api/errors'
import { downloadBackup, downloadLog } from '@/features/systeme/api/systemeApi'
import { RestoreBackupDialog } from '@/features/systeme/components/RestoreBackupDialog'
import { useBackups } from '@/features/systeme/hooks/useBackups'
import { useLogs } from '@/features/systeme/hooks/useLogs'
import {
  useDisableMaintenance,
  useEnableMaintenance,
  useMaintenanceStatus,
} from '@/features/systeme/hooks/useMaintenance'
import { useSystemHealth } from '@/features/systeme/hooks/useSystemHealth'
import { useTriggerBackup } from '@/features/systeme/hooks/useTriggerBackup'
import type {
  Backup,
  BackupStatus,
  LogLevel,
  ScheduledJobStatus,
  ServiceStatus,
} from '@/features/systeme/types'

function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '—'
  if (bytes === 0) return '0 o'
  const units = ['o', 'Ko', 'Mo', 'Go', 'To']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** exponent).toFixed(1)} ${units[exponent]}`
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  // `.replace(' ', 'T')` couvre le format Laravel "Y-m-d H:i:s" (logs) en
  // plus de l'ISO 8601 habituel — sans effet sur ce dernier (pas d'espace).
  return new Date(value.replace(' ', 'T')).toLocaleString('fr-FR')
}

function statusBadgeVariant(
  status: ServiceStatus | ScheduledJobStatus | BackupStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ok':
    case 'success':
      return 'default'
    case 'warning':
    case 'stale':
    case 'partial':
    case 'pending':
      return 'secondary'
    case 'down':
    case 'failed':
      return 'destructive'
    default:
      return 'outline'
  }
}

const backupTypeLabels: Record<Backup['type'], string> = {
  scheduled: 'Planifiée',
  manual: 'Manuelle',
  pre_restore_safety: 'Sécurité (pré-restauration)',
}

function ServiceStatusCard({
  icon: Icon,
  title,
  status,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  status: ServiceStatus
  children?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="text-muted-foreground size-4" />
            {title}
          </CardTitle>
          <Badge variant={statusBadgeVariant(status)}>{status}</Badge>
        </div>
      </CardHeader>
      {children && <CardContent className="text-muted-foreground text-sm">{children}</CardContent>}
    </Card>
  )
}

function HealthTab() {
  const health = useSystemHealth()

  if (health.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (!health.data) {
    return <p className="text-muted-foreground text-sm">Impossible de charger l'état système.</p>
  }

  const { database, redis, disk, queue, scheduledJobs, checkedAt } = health.data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Dernière vérification : {formatDate(checkedAt)}
        </p>
        <Button variant="outline" size="sm" onClick={() => void health.refetch()}>
          <RefreshCw /> Rafraîchir
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ServiceStatusCard icon={Database} title="Base de données" status={database.status}>
          {database.status === 'ok' ? (
            <>
              {database.driver} · {database.latencyMs} ms
            </>
          ) : (
            (database.error ?? 'Indisponible')
          )}
        </ServiceStatusCard>

        <ServiceStatusCard icon={Server} title="Redis / Files d'attente" status={redis.status}>
          {redis.status === 'ok' ? <>{redis.latencyMs} ms</> : (redis.error ?? 'Indisponible')}
        </ServiceStatusCard>

        <ServiceStatusCard icon={ListTodo} title="Jobs échoués" status={queue.status}>
          {queue.failedJobs ?? 0} job(s) en échec
        </ServiceStatusCard>

        <ServiceStatusCard icon={HardDrive} title="Espace disque" status={disk.status}>
          <div className="flex flex-col gap-2">
            <Progress value={disk.usedPercent ?? 0} />
            <span>
              {disk.usedPercent ?? '—'}% utilisé · {formatBytes(disk.freeBytes)} libre sur{' '}
              {formatBytes(disk.totalBytes)}
            </span>
          </div>
        </ServiceStatusCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tâches planifiées</CardTitle>
          <CardDescription>
            Dernière exécution réussie de chaque tâche automatique (scheduler).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tâche</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière exécution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledJobs.map((job) => (
                <TableRow key={job.name}>
                  <TableCell>{job.label}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(job.lastRunAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function BackupsTab() {
  const [page, setPage] = useState(1)
  const backups = useBackups(page)
  const triggerBackup = useTriggerBackup()
  const [restoreTarget, setRestoreTarget] = useState<Backup | undefined>()

  async function handleTrigger() {
    try {
      await triggerBackup.mutateAsync()
      toast.success('Sauvegarde lancée en arrière-plan.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de lancer la sauvegarde.'))
    }
  }

  async function handleDownload(backup: Backup) {
    try {
      await downloadBackup(backup.uuid, backup.filename)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de télécharger cette sauvegarde.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Sauvegardées automatiquement chaque nuit, et conservées selon la politique de rétention
          configurée (locale + hors-site).
        </p>
        <Button onClick={() => void handleTrigger()} disabled={triggerBackup.isPending}>
          Sauvegarder maintenant
        </Button>
      </div>

      <Card>
        <CardContent>
          {backups.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !backups.data || backups.data.backups.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune sauvegarde pour le moment.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fichier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Disques</TableHead>
                    <TableHead>Déclenchée par</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.data.backups.map((backup) => (
                    <TableRow key={backup.uuid}>
                      <TableCell className="max-w-48 truncate font-mono text-xs">
                        {backup.filename}
                      </TableCell>
                      <TableCell>{backupTypeLabels[backup.type]}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(backup.status)}>{backup.status}</Badge>
                        {backup.status === 'failed' && backup.errorMessage && (
                          <p className="text-destructive mt-1 text-xs">{backup.errorMessage}</p>
                        )}
                      </TableCell>
                      <TableCell>{formatBytes(backup.sizeBytes)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {backup.disks.length > 0 ? backup.disks.join(', ') : '—'}
                      </TableCell>
                      <TableCell>{backup.triggeredByNom ?? 'Automatique'}</TableCell>
                      <TableCell>{formatDate(backup.createdAt)}</TableCell>
                      <TableCell className="flex justify-end gap-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={backup.status === 'pending' || backup.status === 'failed'}
                          onClick={() => void handleDownload(backup)}
                          title="Télécharger"
                        >
                          <Download />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={backup.status === 'pending' || backup.status === 'failed'}
                          onClick={() => setRestoreTarget(backup)}
                          title="Restaurer"
                        >
                          <RefreshCw />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <p className="text-muted-foreground text-sm">
                  {backups.data.pagination.from ?? 0}–{backups.data.pagination.to ?? 0} sur{' '}
                  {backups.data.pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= backups.data.pagination.last_page}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <RestoreBackupDialog
        open={restoreTarget !== undefined}
        onOpenChange={(open) => !open && setRestoreTarget(undefined)}
        backup={restoreTarget}
      />
    </div>
  )
}

function MaintenanceTab() {
  const status = useMaintenanceStatus()
  const enable = useEnableMaintenance()
  const disable = useDisableMaintenance()
  const [confirmEnableOpen, setConfirmEnableOpen] = useState(false)

  async function handleEnable() {
    try {
      await enable.mutateAsync()
      toast.success('Mode maintenance activé.')
      setConfirmEnableOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d'activer le mode maintenance."))
    }
  }

  async function handleDisable() {
    try {
      await disable.mutateAsync()
      toast.success('Mode maintenance désactivé.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de désactiver le mode maintenance.'))
    }
  }

  if (status.isLoading) return <Skeleton className="h-32 w-full" />

  const active = status.data?.active ?? false

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="size-4" />
          Mode maintenance
        </CardTitle>
        <CardDescription>
          Bloque l'accès à l'application mobile et publique pendant une intervention. Le tableau de
          bord admin reste accessible pour pouvoir désactiver la maintenance vous-même.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Badge variant={active ? 'destructive' : 'default'}>
          {active ? 'Maintenance active' : 'Application en ligne'}
        </Badge>

        {active ? (
          <Button
            variant="outline"
            onClick={() => void handleDisable()}
            disabled={disable.isPending}
          >
            Désactiver la maintenance
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setConfirmEnableOpen(true)}
            disabled={enable.isPending}
          >
            Activer la maintenance
          </Button>
        )}
      </CardContent>

      <AlertDialog open={confirmEnableOpen} onOpenChange={setConfirmEnableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activer le mode maintenance ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'application mobile et toutes les routes publiques deviendront indisponibles pour les
              utilisateurs jusqu'à la désactivation manuelle depuis cette page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleEnable()
              }}
              disabled={enable.isPending}
            >
              Activer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

const levelLabels: Record<LogLevel, string> = {
  emergency: 'Urgence',
  alert: 'Alerte',
  critical: 'Critique',
  error: 'Erreur',
  warning: 'Avertissement',
  notice: 'Note',
  info: 'Info',
  debug: 'Debug',
}

function logLevelBadgeVariant(
  level: LogLevel,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (level) {
    case 'emergency':
    case 'alert':
    case 'critical':
    case 'error':
      return 'destructive'
    case 'warning':
      return 'secondary'
    default:
      return 'outline'
  }
}

function LogsTab() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [level, setLevel] = useState<LogLevel | 'all'>('all')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  const filters = useMemo(
    () => ({ level: level === 'all' ? undefined : level, search: debouncedSearch || undefined }),
    [level, debouncedSearch],
  )

  const logs = useLogs(filters)

  async function handleDownload() {
    try {
      await downloadLog()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de télécharger le fichier de log.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={level} onValueChange={(value) => setLevel(value!)}>
            <SelectTrigger className="w-48">
              <SelectValue>{level === 'all' ? 'Tous les niveaux' : levelLabels[level]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {(logs.data?.levels ?? []).map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {levelLabels[lvl]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Rechercher dans les messages..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64"
          />
        </div>
        <Button variant="outline" onClick={() => void handleDownload()}>
          <Download /> Télécharger le log complet
        </Button>
      </div>

      <Card>
        <CardContent>
          {logs.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !logs.data || logs.data.entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune entrée trouvée.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.data.entries.map((entry, index) => (
                <details key={index} className="rounded-lg border px-3 py-2">
                  <summary className="flex cursor-pointer items-center gap-3 text-sm">
                    <Badge variant={logLevelBadgeVariant(entry.level)}>{entry.level}</Badge>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatDate(entry.timestamp)}
                    </span>
                    <span className="truncate">{entry.message}</span>
                  </summary>
                  {entry.context && (
                    <pre className="bg-muted mt-2 max-h-64 overflow-auto rounded p-2 text-xs whitespace-pre-wrap">
                      {entry.context}
                    </pre>
                  )}
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function SystemePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Système</h1>

      <Tabs defaultValue="health">
        <TabsList>
          <TabsTrigger value="health">Santé système</TabsTrigger>
          <TabsTrigger value="backups">Sauvegardes</TabsTrigger>
          <TabsTrigger value="maintenance">Mode maintenance</TabsTrigger>
          <TabsTrigger value="logs">Logs d'erreurs</TabsTrigger>
        </TabsList>
        <TabsContent value="health">
          <HealthTab />
        </TabsContent>
        <TabsContent value="backups">
          <BackupsTab />
        </TabsContent>
        <TabsContent value="maintenance">
          <MaintenanceTab />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
