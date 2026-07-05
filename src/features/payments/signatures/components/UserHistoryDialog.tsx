import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUserSignatureHistory } from '@/features/payments/signatures/hooks/useUserSignatureHistory'

import { SignaturePaymentStatusBadge } from './SignaturePaymentStatusBadge'

interface UserHistoryDialogProps {
  userId: number | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserHistoryDialog({ userId, open, onOpenChange }: UserHistoryDialogProps) {
  const history = useUserSignatureHistory(open ? userId : undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historique de paiement — Utilisateur #{userId}</DialogTitle>
          <DialogDescription>
            Toutes les tentatives de signature de cet utilisateur.
          </DialogDescription>
        </DialogHeader>

        {history.isLoading && <Skeleton className="h-48 w-full" />}
        {history.data && (
          <>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="text-xl font-semibold">{history.data.stats.total}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Complétées</p>
                <p className="text-xl font-semibold">{history.data.stats.completed}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">En attente</p>
                <p className="text-xl font-semibold">{history.data.stats.pending}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Échouées</p>
                <p className="text-xl font-semibold">{history.data.stats.failed}</p>
              </div>
            </div>

            {history.data.logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun historique.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.data.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.createdAt).toLocaleString('fr-FR')}</TableCell>
                      <TableCell>{log.signatureType}</TableCell>
                      <TableCell>{log.totalAmount} FCFA</TableCell>
                      <TableCell>
                        <SignaturePaymentStatusBadge status={log.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
