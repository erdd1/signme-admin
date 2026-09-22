import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { useChurches } from '@/features/users/hooks/useChurches'

import { SortieApproveDialog } from '../components/SortieApproveDialog'
import { SortieRejectDialog } from '../components/SortieRejectDialog'
import { SortieStatusBadge } from '../components/SortieStatusBadge'
import { usePendingSorties } from '../hooks/usePendingSorties'
import { useSortiesFinancieres } from '../hooks/useSortiesFinancieres'
import {
  SORTIE_STATUTS,
  SORTIE_TYPES,
  type SortieFinanciere,
  type SortieStatut,
  type SortieType,
} from '../types'

const ALL = '__all__'

const STATUT_LABELS: Record<SortieStatut, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
}

const TYPE_LABELS: Record<SortieType, string> = {
  simple: 'Simple',
  frais: 'Frais',
}

export function SortiesFinancieresPage() {
  const churches = useChurches()

  // States for 'all' tab
  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [statut, setStatut] = useState<SortieStatut | typeof ALL>(ALL)
  const [type, setType] = useState<SortieType | typeof ALL>(ALL)
  const [page, setPage] = useState(1)

  // State for 'pending' tab
  const [pendingPage, setPendingPage] = useState(1)

  // Dialogs state
  const [approveSortie, setApproveSortie] = useState<SortieFinanciere | null>(null)
  const [rejectSortie, setRejectSortie] = useState<SortieFinanciere | null>(null)

  const filters = {
    churchId,
    statut: statut === ALL ? undefined : statut,
    type: type === ALL ? undefined : type,
    page,
    perPage: 20,
  }

  const sortiesAll = useSortiesFinancieres(filters)
  const sortiesPending = usePendingSorties(pendingPage)

  const pendingCount = sortiesPending.data?.pagination.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sorties financières</h1>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Toutes les sorties</TabsTrigger>
          <TabsTrigger value="pending">En attente ({pendingCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
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
                value={type}
                onValueChange={(value) => {
                  setType(value!)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue>
                    {(value: string) =>
                      value === ALL ? 'Tous les types' : TYPE_LABELS[value as SortieType]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les types</SelectItem>
                  {SORTIE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
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
                      value === ALL ? 'Tous les statuts' : STATUT_LABELS[value as SortieStatut]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les statuts</SelectItem>
                  {SORTIE_STATUTS.map((s) => (
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
              {sortiesAll.isLoading && <Skeleton className="h-64 w-full" />}
              {sortiesAll.data && sortiesAll.data.sorties.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucune sortie ne correspond.</p>
              )}
              {sortiesAll.data && sortiesAll.data.sorties.length > 0 && (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Église</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortiesAll.data.sorties.map((sortie) => (
                        <TableRow key={sortie.uuid}>
                          <TableCell>{sortie.church?.nom ?? '—'}</TableCell>
                          <TableCell>{TYPE_LABELS[sortie.type]}</TableCell>
                          <TableCell>{sortie.description}</TableCell>
                          <TableCell className="font-medium">
                            {sortie.montant.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell>
                            <SortieStatusBadge statut={sortie.statut} />
                          </TableCell>
                          <TableCell>{sortie.auteur.nom}</TableCell>
                          <TableCell>
                            {new Date(sortie.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-muted-foreground text-sm">
                      {sortiesAll.data.pagination.from ?? 0}–{sortiesAll.data.pagination.to ?? 0}{' '}
                      sur {sortiesAll.data.pagination.total}
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
                        disabled={page >= sortiesAll.data.pagination.last_page}
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
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {sortiesPending.isLoading && <Skeleton className="h-64 w-full" />}
              {sortiesPending.data && sortiesPending.data.sorties.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucune sortie en attente.</p>
              )}
              {sortiesPending.data && sortiesPending.data.sorties.length > 0 && (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Église</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortiesPending.data.sorties.map((sortie) => (
                        <TableRow key={sortie.uuid}>
                          <TableCell>{sortie.church?.nom ?? '—'}</TableCell>
                          <TableCell>{sortie.description}</TableCell>
                          <TableCell className="font-medium">
                            {sortie.montant.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell>{sortie.auteur.nom}</TableCell>
                          <TableCell>
                            {new Date(sortie.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => setApproveSortie(sortie)}
                              >
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectSortie(sortie)}
                              >
                                Rejeter
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-muted-foreground text-sm">
                      {sortiesPending.data.pagination.from ?? 0}–
                      {sortiesPending.data.pagination.to ?? 0} sur{' '}
                      {sortiesPending.data.pagination.total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingPage <= 1}
                        onClick={() => setPendingPage((p) => p - 1)}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingPage >= sortiesPending.data.pagination.last_page}
                        onClick={() => setPendingPage((p) => p + 1)}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SortieApproveDialog
        sortie={approveSortie}
        open={!!approveSortie}
        onOpenChange={(open) => !open && setApproveSortie(null)}
      />
      <SortieRejectDialog
        sortie={rejectSortie}
        open={!!rejectSortie}
        onOpenChange={(open) => !open && setRejectSortie(null)}
      />
    </div>
  )
}
