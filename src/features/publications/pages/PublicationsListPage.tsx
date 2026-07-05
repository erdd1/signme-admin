import { MoreHorizontal, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { DeletePublicationDialog } from '@/features/publications/components/DeletePublicationDialog'
import { PublicationFormDialog } from '@/features/publications/components/PublicationFormDialog'
import { PublicationTypeBadge } from '@/features/publications/components/PublicationTypeBadge'
import { usePublications } from '@/features/publications/hooks/usePublications'
import {
  type Publication,
  PUBLICATION_TYPES,
  type PublicationType,
} from '@/features/publications/types'
import { useChurches } from '@/features/users/hooks/useChurches'

const ALL = '__all__'

export function PublicationsListPage() {
  const churches = useChurches()

  const [type, setType] = useState<PublicationType | typeof ALL>(ALL)
  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)

  const filters = {
    type: type === ALL ? undefined : type,
    churchId,
    page,
    perPage: 20,
  }

  const publications = usePublications(filters)

  const [formOpen, setFormOpen] = useState(false)
  const [editingPublication, setEditingPublication] = useState<Publication | undefined>(undefined)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingPublication, setDeletingPublication] = useState<Publication | undefined>(undefined)

  function openCreate() {
    setEditingPublication(undefined)
    setFormOpen(true)
  }

  function openEdit(publication: Publication) {
    setEditingPublication(publication)
    setFormOpen(true)
  }

  function openDelete(publication: Publication) {
    setDeletingPublication(publication)
    setDeleteOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Publications</h1>
        <Button onClick={openCreate}>
          <Plus /> Nouvelle publication
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-3 pt-6">
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
                  ({ [ALL]: 'Tous les types', annonce: 'Annonce', meditation: 'Méditation' })[value]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les types</SelectItem>
              {PUBLICATION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === 'annonce' ? 'Annonce' : 'Méditation'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {publications.isLoading && <Skeleton className="h-64 w-full" />}
          {publications.data && publications.data.publications.length === 0 && (
            <p className="text-muted-foreground text-sm">Aucune publication ne correspond.</p>
          )}
          {publications.data && publications.data.publications.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Église</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publications.data.publications.map((publication) => (
                    <TableRow key={publication.id}>
                      <TableCell>
                        <div className="font-medium">{publication.titre}</div>
                        {publication.referenceBiblique && (
                          <div className="text-muted-foreground text-xs">
                            {publication.referenceBiblique}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <PublicationTypeBadge type={publication.type} />
                      </TableCell>
                      <TableCell>
                        {churches.data?.find((c) => c.id === publication.churchId)?.nom ?? '—'}
                      </TableCell>
                      <TableCell>{publication.auteurNom}</TableCell>
                      <TableCell>
                        {new Date(publication.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(publication)}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openDelete(publication)}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <p className="text-muted-foreground text-sm">
                  {publications.data.pagination.from ?? 0}–{publications.data.pagination.to ?? 0}{' '}
                  sur {publications.data.pagination.total}
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
                    disabled={page >= publications.data.pagination.last_page}
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

      <PublicationFormDialog
        key={editingPublication?.id ?? 'create'}
        open={formOpen}
        onOpenChange={setFormOpen}
        publication={editingPublication}
      />
      <DeletePublicationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        publication={deletingPublication}
      />
    </div>
  )
}
