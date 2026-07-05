import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { EvenementFormDialog } from '@/features/evenements/components/EvenementFormDialog'
import { EvenementStatusBadge } from '@/features/evenements/components/EvenementStatusBadge'
import { useEvenements } from '@/features/evenements/hooks/useEvenements'
import { EVENEMENT_STATUTS, type EvenementStatut } from '@/features/evenements/types'
import { useChurches } from '@/features/users/hooks/useChurches'

const ALL = '__all__'

const STATUT_LABELS: Record<EvenementStatut, string> = {
  brouillon: 'Brouillon',
  planifie: 'Planifié',
  actif: 'Actif',
  termine: 'Terminé',
  archive: 'Archivé',
}

export function EvenementsListPage() {
  const churches = useChurches()
  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [statut, setStatut] = useState<EvenementStatut | typeof ALL>(ALL)
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const filters = {
    churchId,
    statut: statut === ALL ? undefined : statut,
    page,
    perPage: 20,
  }

  const evenements = useEvenements(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Événements</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Nouvel événement
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Select
            value={churchId ? String(churchId) : ALL}
            onValueChange={(value) => {
              setChurchId(value === ALL ? undefined : Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-56">
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
            value={statut}
            onValueChange={(value) => {
              setStatut(value!)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue>
                {(value: string) =>
                  value === ALL ? 'Tous les statuts' : STATUT_LABELS[value as EvenementStatut]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              {EVENEMENT_STATUTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {evenements.isLoading && <Skeleton className="h-64 w-full" />}
          {evenements.data && evenements.data.evenements.length === 0 && (
            <p className="text-muted-foreground text-sm">Aucun événement ne correspond.</p>
          )}
          {evenements.data && evenements.data.evenements.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Église</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Contributeurs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evenements.data.evenements.map((evenement) => (
                    <TableRow key={evenement.uuid}>
                      <TableCell>
                        <Link
                          to={`/evenements/${evenement.uuid}`}
                          className="font-medium hover:underline"
                        >
                          {evenement.titre}
                        </Link>
                      </TableCell>
                      <TableCell>{evenement.church.nom}</TableCell>
                      <TableCell>
                        <EvenementStatusBadge statut={evenement.statut} />
                      </TableCell>
                      <TableCell>
                        <div>{evenement.dateDebut}</div>
                        {evenement.dateFin && (
                          <div className="text-muted-foreground text-xs">
                            au {evenement.dateFin.slice(0, 10)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-40">
                        {evenement.objectifMontant ? (
                          <div className="flex flex-col gap-1">
                            <Progress value={evenement.pourcentageObjectif ?? 0} />
                            <span className="text-muted-foreground text-xs">
                              {evenement.montantCollecte} / {evenement.objectifMontant} FCFA (
                              {evenement.pourcentageObjectif ?? 0}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {evenement.montantCollecte} FCFA (pas d'objectif)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{evenement.nombreContributeurs ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <p className="text-muted-foreground text-sm">
                  {evenements.data.pagination.from ?? 0}–{evenements.data.pagination.to ?? 0} sur{' '}
                  {evenements.data.pagination.total}
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
                    disabled={page >= evenements.data.pagination.last_page}
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

      <EvenementFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
