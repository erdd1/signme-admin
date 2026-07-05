import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useChurches } from '@/features/users/hooks/useChurches'

import { SignaturePaymentStatusBadge } from '../components/SignaturePaymentStatusBadge'
import { UserHistoryDialog } from '../components/UserHistoryDialog'
import { usePaymentDetail } from '../hooks/usePaymentDetail'
import { usePaymentEvents } from '../hooks/usePaymentEvents'
import { usePaymentReceipt } from '../hooks/usePaymentReceipt'
import { usePaymentSyncLogs } from '../hooks/usePaymentSyncLogs'
import { useRecheckPayment } from '../hooks/useRecheckPayment'
import { useSignaturePaymentLogs } from '../hooks/useSignaturePaymentLogs'
import { useSignaturePaymentStats } from '../hooks/useSignaturePaymentStats'
import {
  SIGNATURE_PAYMENT_STATUSES,
  SIGNATURE_TYPES,
  type SignaturePaymentStatus,
  type SignatureType,
} from '../types'

const ALL = '__all__'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

export function SignaturePaymentsPage() {
  const churches = useChurches()

  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<SignaturePaymentStatus | typeof ALL>(ALL)
  const [signatureType, setSignatureType] = useState<SignatureType | typeof ALL>(ALL)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [historyUserId, setHistoryUserId] = useState<number | undefined>(undefined)
  const [historyOpen, setHistoryOpen] = useState(false)

  const [detailTransactionId, setDetailTransactionId] = useState<number | undefined>(undefined)
  const [detailOpen, setDetailOpen] = useState(false)
  const [logsTransactionId, setLogsTransactionId] = useState<number | undefined>(undefined)
  const [logsOpen, setLogsOpen] = useState(false)
  const [logsPage, setLogsPage] = useState(1)

  const statsFilters = useMemo(
    () => ({
      churchId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [churchId, startDate, endDate],
  )

  const logFilters = useMemo(
    () => ({
      ...statsFilters,
      status: status === ALL ? undefined : status,
      signatureType: signatureType === ALL ? undefined : signatureType,
      page,
      perPage: 20,
    }),
    [statsFilters, status, signatureType, page],
  )

  const stats = useSignaturePaymentStats(statsFilters)
  const logs = useSignaturePaymentLogs(logFilters)

  const detailQuery = usePaymentDetail(detailTransactionId, detailOpen)
  const eventsQuery = usePaymentEvents(detailTransactionId, detailOpen)
  const syncLogsQuery = usePaymentSyncLogs(logsTransactionId, logsPage, logsOpen)
  const recheckPayment = useRecheckPayment()
  const paymentReceipt = usePaymentReceipt()

  function openHistory(userId: number) {
    setHistoryUserId(userId)
    setHistoryOpen(true)
  }

  function openDetail(transactionId: number) {
    setDetailTransactionId(transactionId)
    setDetailOpen(true)
  }

  function openLogs(transactionId: number) {
    setLogsTransactionId(transactionId)
    setLogsPage(1)
    setLogsOpen(true)
  }

  async function handleRecheck(transactionId: number) {
    try {
      await recheckPayment.mutateAsync(transactionId)
      toast.success('Statut revérifié avec succès.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de revérifier ce paiement.'))
    }
  }

  async function handleViewReceipt(transactionId: number) {
    try {
      const blob = await paymentReceipt.mutateAsync({ transactionId, download: false })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de générer le reçu.'))
    }
  }

  async function handleExportPdf(transactionId: number, reference: string | null) {
    try {
      const blob = await paymentReceipt.mutateAsync({ transactionId, download: true })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recu-${reference ?? transactionId}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d'exporter le reçu."))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Paiements de signatures</h1>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.isLoading && <Skeleton className="h-20 w-full" />}
          {stats.data && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
              <StatCard label="Tentatives" value={stats.data.totalAttempts} />
              <StatCard label="Complétées" value={stats.data.completed} />
              <StatCard label="En attente" value={stats.data.pending} />
              <StatCard label="Échouées" value={stats.data.failed} />
              <StatCard label="Montant encaissé" value={`${stats.data.totalAmount} FCFA`} />
              <StatCard label="Frais totaux" value={`${stats.data.totalFees} FCFA`} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Select
            value={churchId ? String(churchId) : ALL}
            onValueChange={(value) => {
              setChurchId(value === ALL ? undefined : Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                {(value: string) =>
                  value === ALL
                    ? 'Toutes les églises'
                    : (churches.data?.find((c) => String(c.id) === value)?.nom ?? value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les églises</SelectItem>
              {churches.data?.map((church) => (
                <SelectItem key={church.id} value={String(church.id)}>
                  {church.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value!)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue>
                {(value: string) =>
                  ({
                    [ALL]: 'Tous les statuts',
                    pending: 'En attente',
                    completed: 'Complété',
                    failed: 'Échoué',
                  })[value]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              {SIGNATURE_PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={signatureType}
            onValueChange={(value) => {
              setSignatureType(value!)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue>
                {(value: string) => (value === ALL ? 'Tous les types' : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les types</SelectItem>
              {SIGNATURE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value)
              setPage(1)
            }}
            className="w-40"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value)
              setPage(1)
            }}
            className="w-40"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {logs.isLoading && <Skeleton className="h-64 w-full" />}
          {logs.data && logs.data.logs.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Aucun paiement ne correspond aux filtres.
            </p>
          )}
          {logs.data && logs.data.logs.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mois</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Frais</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.data.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.createdAt).toLocaleString('fr-FR')}</TableCell>
                      <TableCell>Utilisateur #{log.userId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.signatureType}</Badge>
                      </TableCell>
                      <TableCell>{log.months.join(', ')}</TableCell>
                      <TableCell>{log.totalAmount} FCFA</TableCell>
                      <TableCell>{log.fees} FCFA</TableCell>
                      <TableCell>
                        {log.paymentMethod}
                        {log.phoneNumber ? ` — ${log.phoneNumber}` : ''}
                      </TableCell>
                      <TableCell>
                        <SignaturePaymentStatusBadge status={log.status} />
                      </TableCell>
                      <TableCell className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openHistory(log.userId)}>
                          Historique
                        </Button>
                        <PaymentActionsMenu
                          disabled={log.transactionId === null}
                          disabledReason="Signature présentielle — aucune transaction de paiement associée."
                          canRecheck={log.status === 'pending'}
                          isRechecking={recheckPayment.isPending}
                          onViewDetail={() => openDetail(log.transactionId!)}
                          onViewReceipt={() => void handleViewReceipt(log.transactionId!)}
                          onRecheck={() => void handleRecheck(log.transactionId!)}
                          onViewLogs={() => openLogs(log.transactionId!)}
                          onExportPdf={() =>
                            void handleExportPdf(log.transactionId!, log.paymentReference)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <p className="text-muted-foreground text-sm">
                  {logs.data.pagination.from ?? 0}–{logs.data.pagination.to ?? 0} sur{' '}
                  {logs.data.pagination.total}
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
                    disabled={page >= logs.data.pagination.last_page}
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

      <UserHistoryDialog userId={historyUserId} open={historyOpen} onOpenChange={setHistoryOpen} />

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
