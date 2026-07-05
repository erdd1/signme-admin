import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEvenementContributions } from '@/features/evenements/hooks/useEvenementContributions'
import type { ContributionStatus } from '@/features/payments/contributions/types'

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

export function EvenementContributionsTab({ uuid }: { uuid: string }) {
  const [page, setPage] = useState(1)
  const contributions = useEvenementContributions(uuid, page)

  if (contributions.isLoading) return <Skeleton className="h-48 w-full" />

  if (contributions.data && contributions.data.contributions.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucune contribution pour cet événement.</p>
  }

  if (!contributions.data) return null

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Contributeur</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Frais</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Méthode</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contributions.data.contributions.map((c) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {contributions.data.pagination.from ?? 0}–{contributions.data.pagination.to ?? 0} sur{' '}
          {contributions.data.pagination.total}
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
    </div>
  )
}
