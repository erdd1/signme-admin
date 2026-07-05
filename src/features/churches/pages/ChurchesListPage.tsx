import { MoreHorizontal, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChurchFormDialog } from '@/features/churches/components/ChurchFormDialog'
import { DeleteChurchDialog } from '@/features/churches/components/DeleteChurchDialog'
import { useChurches } from '@/features/churches/hooks/useChurches'
import type { Church } from '@/features/churches/types'

export function ChurchesListPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  const filters = useMemo(
    () => ({ search: debouncedSearch || undefined, page, perPage: 20 }),
    [debouncedSearch, page],
  )

  const churches = useChurches(filters)

  const [formOpen, setFormOpen] = useState(false)
  const [editingChurch, setEditingChurch] = useState<Church | undefined>(undefined)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingChurch, setDeletingChurch] = useState<Church | undefined>(undefined)

  function openCreate() {
    setEditingChurch(undefined)
    setFormOpen(true)
  }

  function openEdit(church: Church) {
    setEditingChurch(church)
    setFormOpen(true)
  }

  function openDelete(church: Church) {
    setDeletingChurch(church)
    setDeleteOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Églises</h1>
        <Button onClick={openCreate}>
          <Plus /> Nouvelle église
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Input
            placeholder="Rechercher (nom, ville, région)..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {churches.isLoading && <Skeleton className="h-64 w-full" />}
          {churches.data && churches.data.churches.length === 0 && (
            <p className="text-muted-foreground text-sm">Aucune église ne correspond.</p>
          )}
          {churches.data && churches.data.churches.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Région</TableHead>
                    <TableHead>Membres actifs</TableHead>
                    <TableHead>Pasteur</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {churches.data.churches.map((church) => (
                    <TableRow key={church.id}>
                      <TableCell>
                        <Link to={`/eglises/${church.id}`} className="font-medium hover:underline">
                          {church.nom}
                        </Link>
                      </TableCell>
                      <TableCell>{church.ville}</TableCell>
                      <TableCell>{church.region ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{church.totalMembres}</Badge>
                      </TableCell>
                      <TableCell>{church.pastorNom ?? '—'}</TableCell>
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
                            <DropdownMenuItem
                              render={<Link to={`/eglises/${church.id}`}>Voir détail</Link>}
                            />
                            <DropdownMenuItem onClick={() => openEdit(church)}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openDelete(church)}
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
                  {churches.data.pagination.from ?? 0}–{churches.data.pagination.to ?? 0} sur{' '}
                  {churches.data.pagination.total}
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
                    disabled={page >= churches.data.pagination.last_page}
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

      <ChurchFormDialog
        key={editingChurch?.id ?? 'create'}
        open={formOpen}
        onOpenChange={setFormOpen}
        church={editingChurch}
      />
      <DeleteChurchDialog open={deleteOpen} onOpenChange={setDeleteOpen} church={deletingChurch} />
    </div>
  )
}
