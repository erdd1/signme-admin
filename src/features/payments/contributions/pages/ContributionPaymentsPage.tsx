import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { getApiErrorMessage } from '@/core/api/errors'
import { PaymentActionsMenu } from '@/features/payments/shared/components/PaymentActionsMenu'
import { PaymentDetailDialog } from '@/features/payments/shared/components/PaymentDetailDialog'
import { PaymentSyncLogsDialog } from '@/features/payments/shared/components/PaymentSyncLogsDialog'

import { useContributionDetail } from '../hooks/useContributionDetail'
import { useContributionEvents } from '../hooks/useContributionEvents'
import { useContributionPayments } from '../hooks/useContributionPayments'
import { useContributionReceipt } from '../hooks/useContributionReceipt'
import { useContributionSyncLogs } from '../hooks/useContributionSyncLogs'
import { useRecheckContribution } from '../hooks/useRecheckContribution'
import type { ContributionStatus } from '../types'

const ALL = '__all__'

const STATUS_LABELS: Record<ContributionStatus, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
}

const STATUS_VARIANTS: Record<ContributionStatus, 'default' | 'secondary' | 'destructive'> = {
  completed: 'default',
  pending: 'secondary',
  failed: 'destructive',
}

export function ContributionPaymentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ContributionStatus | typeof ALL>(ALL)

  const contributions = useContributionPayments(page)

  const [detailUuid, setDetailUuid] = useState<string | undefined>(undefined)
  const [detailOpen, setDetailOpen] = useState(false)
  const [logsUuid, setLogsUuid] = useState<string | undefined>(undefined)
  const [logsOpen, setLogsOpen] = useState(false)
  const [logsPage, setLogsPage] = useState(1)

  const detailQuery = useContributionDetail(detailUuid, detailOpen)
  const eventsQuery = useContributionEvents(detailUuid, detailOpen)
  const syncLogsQuery = useContributionSyncLogs(logsUuid, logsPage, logsOpen)
  const recheckContribution = useRecheckContribution()
  const contributionReceipt = useContributionReceipt()

  function openDetail(uuid: string) {
    setDetailUuid(uuid)
    setDetailOpen(true)
  }

  function openLogs(uuid: string) {
    setLogsUuid(uuid)
    setLogsPage(1)
    setLogsOpen(true)
  }

  async function handleRecheck(uuid: string) {
    try {
      await recheckContribution.mutateAsync(uuid)
      toast.success('Statut revérifié avec succès.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de revérifier cette contribution.'))
    }
  }

  async function handleViewReceipt(uuid: string) {
    try {
      const blob = await contributionReceipt.mutateAsync({ uuid, download: false })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de générer le reçu.'))
    }
  }

  async function handleExportPdf(uuid: string, reference: string | null) {
    try {
      const blob = await contributionReceipt.mutateAsync({ uuid, download: true })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recu-${reference ?? uuid}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d'exporter le reçu."))
    }
  }

  const filtered = useMemo(() => {
    if (!contributions.data) return []
    const query = search.trim().toLowerCase()
    return contributions.data.contributions.filter((c) => {
      const matchesSearch =
        query === '' ||
        (c.contributeur?.nom.toLowerCase().includes(query) ?? false) ||
        c.evenement.titre.toLowerCase().includes(query)
      const matchesStatus = status === ALL || c.statut === status
      return matchesSearch && matchesStatus
    })
  }, [contributions.data, search, status])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Paiements de contributions</h1>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Input
            placeholder="Rechercher (contributeur, événement)..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-xs"
          />
          <Select value={status} onValueChange={(value) => setStatus(value!)}>
            <SelectTrigger className="w-40">
              <SelectValue>
                {(value: string) =>
                  value === ALL ? 'Tous les statuts' : STATUS_LABELS[value as ContributionStatus]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="completed">Complété</SelectItem>
              <SelectItem value="failed">Échoué</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Recherche et statut s'appliquent uniquement à la page actuellement chargée
            {contributions.data ? ` (${contributions.data.pagination.total} au total)` : ''}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {contributions.isLoading && <Skeleton className="h-64 w-full" />}
          {contributions.data && filtered.length === 0 && (
            <p className="text-muted-foreground text-sm">Aucune contribution ne correspond.</p>
          )}
          {contributions.data && filtered.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Contributeur</TableHead>
                    <TableHead>Événement</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Frais</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.uuid}>
                      <TableCell>{new Date(c.createdAt).toLocaleString('fr-FR')}</TableCell>
                      <TableCell>
                        {c.contributeur ? (
                          <>
                            <div className="font-medium">{c.contributeur.nom}</div>
                            {c.contributeur.groupe && (
                              <div className="text-muted-foreground text-xs">
                                {c.contributeur.groupe.nom}
                              </div>
                            )}
                          </>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{c.evenement.titre}</TableCell>
                      <TableCell>{c.montant} FCFA</TableCell>
                      <TableCell>{c.frais} FCFA</TableCell>
                      <TableCell>{c.montantTotal} FCFA</TableCell>
                      <TableCell>
                        {c.paymentOperator ?? c.paymentMethod}
                        {c.paymentNumber ? ` — ${c.paymentNumber}` : ''}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[c.statut]}>{STATUS_LABELS[c.statut]}</Badge>
                      </TableCell>
                      <TableCell>{c.note ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <PaymentActionsMenu
                          canRecheck={c.statut === 'pending'}
                          isRechecking={recheckContribution.isPending}
                          onViewDetail={() => openDetail(c.uuid)}
                          onViewReceipt={() => void handleViewReceipt(c.uuid)}
                          onRecheck={() => void handleRecheck(c.uuid)}
                          onViewLogs={() => openLogs(c.uuid)}
                          onExportPdf={() => void handleExportPdf(c.uuid, c.paymentReference)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <p className="text-muted-foreground text-sm">
                  {contributions.data.pagination.from ?? 0}–{contributions.data.pagination.to ?? 0}{' '}
                  sur {contributions.data.pagination.total}
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
                    disabled={page >= contributions.data.pagination.last_page}
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

      <PaymentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        detail={detailQuery.data}
        events={eventsQuery.data?.events}
        isLoading={detailQuery.isLoading || eventsQuery.isLoading}
      />

      <PaymentSyncLogsDialog
        open={logsOpen}
        onOpenChange={setLogsOpen}
        logs={syncLogsQuery.data?.logs}
        pagination={syncLogsQuery.data?.pagination}
        isLoading={syncLogsQuery.isLoading}
        page={logsPage}
        onPageChange={setLogsPage}
      />
    </div>
  )
}
