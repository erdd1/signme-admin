import { MoreHorizontal, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getApiErrorMessage } from '@/core/api/errors'
import { useAuthStore } from '@/features/auth/store/authStore'
import { DeleteUserDialog } from '@/features/users/components/DeleteUserDialog'
import { ManagedListsPanel } from '@/features/users/components/ManagedListsPanel'
import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge'
import { useChurches } from '@/features/users/hooks/useChurches'
import { useToggleUserStatus } from '@/features/users/hooks/useToggleUserStatus'
import { useUsers } from '@/features/users/hooks/useUsers'
import { useUserStats } from '@/features/users/hooks/useUserStats'
import {
  type Region,
  REGIONS,
  type Role,
  ROLES,
  type Sexe,
  SEXES,
  type User,
} from '@/features/users/types'

const ALL = '__all__'

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

export function UsersListPage() {
  const currentUser = useAuthStore((state) => state.user)
  const churches = useChurches()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState<Role | typeof ALL>(ALL)
  const [actif, setActif] = useState<'actif' | 'inactif' | typeof ALL>(ALL)
  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [sexe, setSexe] = useState<Sexe | typeof ALL>(ALL)
  const [originaireDe, setOriginaireDe] = useState<Region | typeof ALL>(ALL)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      role: role === ALL ? undefined : role,
      actif: actif === ALL ? undefined : actif === 'actif',
      churchId,
      sexe: sexe === ALL ? undefined : sexe,
      originaireDe: originaireDe === ALL ? undefined : originaireDe,
      page,
      perPage: 20,
    }),
    [debouncedSearch, role, actif, churchId, sexe, originaireDe, page],
  )

  const users = useUsers(filters)
  const stats = useUserStats(churchId)
  const toggleStatus = useToggleUserStatus()

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | undefined>(undefined)

  function openCreate() {
    setEditingUser(undefined)
    setFormOpen(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setFormOpen(true)
  }

  function openDelete(user: User) {
    setDeletingUser(user)
    setDeleteOpen(true)
  }

  async function handleToggleStatus(user: User) {
    try {
      await toggleStatus.mutateAsync(user.id)
      toast.success(user.actif ? 'Compte désactivé.' : 'Compte activé.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Utilisateurs</h1>

      <Tabs defaultValue="utilisateurs">
        <TabsList>
          <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
          <TabsTrigger value="listes-gerees">Quartiers, Villes, Groupes</TabsTrigger>
        </TabsList>

        <TabsContent value="utilisateurs" className="flex flex-col gap-6">
          <div className="flex items-center justify-end">
            <Button onClick={openCreate}>
              <Plus /> Nouvel utilisateur
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>
                Sélectionnez une église dans les filtres pour voir sa répartition démographique.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!churchId && (
                <p className="text-muted-foreground text-sm">Aucune église sélectionnée.</p>
              )}
              {churchId && stats.isLoading && <Skeleton className="h-20 w-full" />}
              {stats.data && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <StatCard label="Total" value={stats.data.totalFideles} />
                  <StatCard label="Hommes" value={stats.data.hommes} />
                  <StatCard label="Femmes" value={stats.data.femmes} />
                  <StatCard label="Au Cameroun" value={stats.data.auCameroun} />
                  <StatCard label="Hors Cameroun" value={stats.data.horsCameroun} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-wrap gap-3 pt-6">
              <Input
                placeholder="Rechercher (nom, email, téléphone)..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                className="max-w-xs"
              />
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value!)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue>
                    {(value: string) => (value === ALL ? 'Tous les rôles' : value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les rôles</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={actif}
                onValueChange={(value) => {
                  setActif(value!)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue>
                    {(value: string) =>
                      ({ [ALL]: 'Tous les statuts', actif: 'Actif', inactif: 'Inactif' })[value]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
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
                value={sexe}
                onValueChange={(value) => {
                  setSexe(value!)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue>{(value: string) => (value === ALL ? 'Tous' : value)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous</SelectItem>
                  {SEXES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={originaireDe}
                onValueChange={(value) => {
                  setOriginaireDe(value!)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue>
                    {(value: string) => (value === ALL ? 'Toutes régions' : value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Toutes régions</SelectItem>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {users.isLoading && <Skeleton className="h-64 w-full" />}
              {users.data && users.data.users.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Aucun utilisateur ne correspond aux filtres.
                </p>
              )}
              {users.data && users.data.users.length > 0 && (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Membre</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Église</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.data.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-8">
                                <AvatarImage src={user.photoUrl ?? undefined} alt={user.nom} />
                                <AvatarFallback>
                                  {user.nom.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.nom}</div>
                                <div className="text-muted-foreground text-xs">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.church?.nom ?? '—'}</TableCell>
                          <TableCell>
                            <UserStatusBadge actif={user.actif} />
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
                                <DropdownMenuItem onClick={() => openEdit(user)}>
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={
                                    user.role === 'administrateur' && user.id === currentUser?.id
                                  }
                                  onClick={() => void handleToggleStatus(user)}
                                >
                                  {user.actif ? 'Désactiver' : 'Activer'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  disabled={user.role === 'administrateur'}
                                  onClick={() => openDelete(user)}
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
                      {users.data.pagination.from ?? 0}–{users.data.pagination.to ?? 0} sur{' '}
                      {users.data.pagination.total}
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
                        disabled={page >= users.data.pagination.last_page}
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

          <UserFormDialog
            key={editingUser?.id ?? 'create'}
            open={formOpen}
            onOpenChange={setFormOpen}
            user={editingUser}
          />
          <DeleteUserDialog open={deleteOpen} onOpenChange={setDeleteOpen} user={deletingUser} />
        </TabsContent>

        <TabsContent value="listes-gerees">
          <ManagedListsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
