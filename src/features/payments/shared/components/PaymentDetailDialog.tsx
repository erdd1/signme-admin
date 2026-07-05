import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { PaymentDetail, PaymentEvent } from '@/features/payments/shared/types'

interface PaymentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail: PaymentDetail | undefined
  events: PaymentEvent[] | undefined
  isLoading: boolean
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  )
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString('fr-FR') : '—'
}

export function PaymentDetailDialog({
  open,
  onOpenChange,
  detail,
  events,
  isLoading,
}: PaymentDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détail du paiement</DialogTitle>
        </DialogHeader>

        {isLoading && <Skeleton className="h-64 w-full" />}

        {detail && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Référence interne SignMe" value={detail.referenceInterne} />
              <Field label="Référence Notch Pay" value={detail.referenceNotchPay ?? '—'} />
              <Field
                label="ID de transaction (gateway)"
                value={detail.transactionIdGateway ?? '—'}
              />
              <Field label="Statut" value={<Badge variant="outline">{detail.status}</Badge>} />
              <Field label="Date de création" value={formatDate(detail.createdAt)} />
              <Field label="Date de confirmation" value={formatDate(detail.confirmedAt)} />
              <Field
                label="Moyen de paiement"
                value={
                  detail.paymentOperator
                    ? `${detail.paymentMethod} — ${detail.paymentOperator}`
                    : detail.paymentMethod
                }
              />
              <Field label="Numéro masqué" value={detail.paymentNumberMasked ?? '—'} />
              <Field label="Frais" value={`${detail.fees} FCFA`} />
              <Field label="Montant net (débité)" value={`${detail.netAmount} FCFA`} />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Historique des événements</h3>
              {(!events || events.length === 0) && (
                <p className="text-muted-foreground text-sm">Aucun événement enregistré.</p>
              )}
              {events && events.length > 0 && (
                <div className="flex flex-col gap-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>{event.eventType}</span>
                      <Badge variant="outline">{event.resultingStatus}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Dernier webhook reçu</h3>
              {detail.lastWebhookPayload ? (
                <pre className="bg-muted max-h-48 overflow-auto rounded-md p-3 text-xs">
                  {JSON.stringify(detail.lastWebhookPayload, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">Aucun webhook reçu pour le moment.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
