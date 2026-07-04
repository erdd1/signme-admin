import { Download } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  useAllFailedAttempts,
  useAllLogins,
  useAuditTrail,
  useExportAuditTrail,
  useSecurityAlerts,
  useSecurityLogs,
} from '@/features/auth/hooks/useSecurity'

function formatTimestamp(value: string) {
  return new Date(value.replace(' ', 'T')).toLocaleString('fr-FR')
}

function AlertsTab() {
  const alerts = useSecurityAlerts({ hours: 24, limit: 100 })

  if (alerts.isLoading) return <Skeleton className="h-32 w-full" />
  if (!alerts.data || alerts.data.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucune alerte sur les dernières 24h.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>IP</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.data.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell>{alert.userName}</TableCell>
            <TableCell>
              <Badge variant="destructive">{alert.action}</Badge>
            </TableCell>
            <TableCell>{alert.ipAddress ?? '—'}</TableCell>
            <TableCell>{formatTimestamp(alert.timestamp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function SecurityLogsTab() {
  const logs = useSecurityLogs({ days: 30, limit: 100 })

  if (logs.isLoading) return <Skeleton className="h-32 w-full" />
  if (!logs.data || logs.data.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucun log sur les 30 derniers jours.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.data.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{log.userName}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>
              <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                {log.status}
              </Badge>
            </TableCell>
            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MyTrailTab() {
  const trail = useAuditTrail({ days: 30, limit: 100 })

  if (trail.isLoading) return <Skeleton className="h-32 w-full" />
  if (!trail.data || trail.data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Aucun événement sur les 30 derniers jours.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trail.data.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.action}</TableCell>
            <TableCell>
              <Badge variant={entry.status === 'success' ? 'default' : 'destructive'}>
                {entry.status}
              </Badge>
            </TableCell>
            <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function LoginsTab() {
  const logins = useAllLogins({ days: 30, limit: 100 })

  if (logins.isLoading) return <Skeleton className="h-32 w-full" />
  if (!logins.data || logins.data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Aucune connexion sur les 30 derniers jours.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>IP</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logins.data.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.userName}</TableCell>
            <TableCell>{entry.ipAddress ?? '—'}</TableCell>
            <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function FailedAttemptsTab() {
  const attempts = useAllFailedAttempts({ days: 7, limit: 100 })

  if (attempts.isLoading) return <Skeleton className="h-32 w-full" />
  if (!attempts.data || attempts.data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Aucune tentative échouée sur les 7 derniers jours.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Raison</TableHead>
          <TableHead>IP</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attempts.data.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.userName}</TableCell>
            <TableCell>{entry.reason}</TableCell>
            <TableCell>{entry.ipAddress ?? '—'}</TableCell>
            <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function SecurityPage() {
  const exportAuditTrail = useExportAuditTrail()

  async function handleExport() {
    try {
      const blob = await exportAuditTrail.mutateAsync(30)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Échec de l'export."))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sécurité</h1>
        <Button
          variant="outline"
          onClick={() => void handleExport()}
          disabled={exportAuditTrail.isPending}
        >
          <Download /> Exporter en CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble</CardTitle>
          <CardDescription>Alertes, logs et historique d'audit du système.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts">
            <TabsList>
              <TabsTrigger value="alerts">Alertes</TabsTrigger>
              <TabsTrigger value="logs">Logs de sécurité</TabsTrigger>
              <TabsTrigger value="my-trail">Mon historique</TabsTrigger>
              <TabsTrigger value="logins">Connexions</TabsTrigger>
              <TabsTrigger value="attempts">Tentatives échouées</TabsTrigger>
            </TabsList>
            <TabsContent value="alerts">
              <AlertsTab />
            </TabsContent>
            <TabsContent value="logs">
              <SecurityLogsTab />
            </TabsContent>
            <TabsContent value="my-trail">
              <MyTrailTab />
            </TabsContent>
            <TabsContent value="logins">
              <LoginsTab />
            </TabsContent>
            <TabsContent value="attempts">
              <FailedAttemptsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
