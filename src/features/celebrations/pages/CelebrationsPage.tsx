import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

import { CelebrationTypeEditDialog } from '../components/CelebrationTypeEditDialog'
import { DeleteCelebrationDialog } from '../components/DeleteCelebrationDialog'
import { useCelebrationInstances } from '../hooks/useCelebrationInstances'
import { useCelebrationTypes } from '../hooks/useCelebrationTypes'
import { useUpdateCelebrationType } from '../hooks/useUpdateCelebrationType'
import type { Celebration, CelebrationType } from '../types'

export function CelebrationsPage() {
  const types = useCelebrationTypes()
  const updateType = useUpdateCelebrationType()
  const [editingType, setEditingType] = useState<CelebrationType | null>(null)

  const [page, setPage] = useState(1)
  const instances = useCelebrationInstances({ page, perPage: 20 })
  const [deletingCelebration, setDeletingCelebration] = useState<Celebration | null>(null)

  async function toggleActive(type: CelebrationType) {
    try {
      await updateType.mutateAsync({ id: type.id, payload: { active: !type.active } })
      toast.success(type.active ? 'Occasion désactivée' : 'Occasion activée')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de mettre à jour cette occasion.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Célébrations</h1>
      </div>

      <Tabs defaultValue="types">
        <TabsList>
          <TabsTrigger value="types">Occasions</TabsTrigger>
          <TabsTrigger value="history">Historique envoyé</TabsTrigger>
        </TabsList>

        {/* ── Occasions (catalogue des 9 types) ─────────────────────────── */}
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {types.isLoading && <Skeleton className="h-64 w-full" />}
              {types.data && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Occasion</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {types.data.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.label}</TableCell>
                        <TableCell className="text-muted-foreground max-w-md truncate">
                          {type.titre}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="cursor-pointer"
                            variant={type.active ? 'default' : 'secondary'}
                            onClick={() => void toggleActive(type)}
                          >
                            {type.active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setEditingType(type)}>
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Modifier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Historique (instances envoyées, toutes églises) ───────────── */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {instances.isLoading && <Skeleton className="h-64 w-full" />}
              {instances.data && instances.data.celebrations.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucune célébration envoyée.</p>
              )}
              {instances.data && instances.data.celebrations.length > 0 && (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Église</TableHead>
                        <TableHead>Occasion</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Lue</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {instances.data.celebrations.map((celebration) => (
                        <TableRow key={celebration.uuid}>
                          <TableCell>{celebration.userNom ?? '—'}</TableCell>
                          <TableCell>{celebration.churchNom ?? '—'}</TableCell>
                          <TableCell>{celebration.label}</TableCell>
                          <TableCell>
                            {new Date(celebration.occursOn).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={celebration.isRead ? 'default' : 'secondary'}>
                              {celebration.isRead ? 'Lue' : 'Non lue'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeletingCelebration(celebration)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-muted-foreground text-sm">
                      {instances.data.pagination.from ?? 0}–{instances.data.pagination.to ?? 0} sur{' '}
                      {instances.data.pagination.total}
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
                        disabled={page >= instances.data.pagination.last_page}
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
      </Tabs>

      <CelebrationTypeEditDialog
        type={editingType}
        open={!!editingType}
        onOpenChange={(open) => !open && setEditingType(null)}
      />
      <DeleteCelebrationDialog
        celebration={deletingCelebration}
        open={!!deletingCelebration}
        onOpenChange={(open) => !open && setDeletingCelebration(null)}
      />
    </div>
  )
}
