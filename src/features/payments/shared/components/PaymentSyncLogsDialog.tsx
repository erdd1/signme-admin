import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { PaginationMeta } from '@/core/api/types'
import type { PaymentSyncLog } from '@/features/payments/shared/types'

interface PaymentSyncLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: PaymentSyncLog[] | undefined
  pagination: PaginationMeta | undefined
  isLoading: boolean
  page: number
  onPageChange: (page: number) => void
}

export function PaymentSyncLogsDialog({
  open,
  onOpenChange,
  logs,
  pagination,
  isLoading,
  page,
  onPageChange,
}: PaymentSyncLogsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Logs de synchronisation (diagnostic technique)</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-xs">
          Chaque vérification automatique auprès du gateway, y compris celles qui n'ont rien changé.
          Conservé 7 jours seulement — distinct de l'historique des événements permanent.
        </p>

        {isLoading && <Skeleton className="h-48 w-full" />}

        {logs?.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucun log de synchronisation disponible.</p>
        )}

        {logs && logs.length > 0 && (
          <div className="flex flex-col gap-2">
            {logs.map((log) => (
              <div key={log.id} className="rounded-md border p-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>{new Date(log.checkedAt).toLocaleString('fr-FR')}</span>
                  <Badge variant="outline">{log.resultingStatus}</Badge>
                </div>
                {log.rawPayload && (
                  <pre className="bg-muted mt-2 max-h-32 overflow-auto rounded p-2 text-xs">
                    {JSON.stringify(log.rawPayload, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-muted-foreground text-sm">
              {pagination.from ?? 0}–{pagination.to ?? 0} sur {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.last_page}
                onClick={() => onPageChange(page + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
