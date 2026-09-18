import { KeyRound, Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

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
import { AdminPermissionsSheet } from '@/features/administrateurs/components/AdminPermissionsSheet'
import { CreateAdminDialog } from '@/features/administrateurs/components/CreateAdminDialog'
import { useAdmins } from '@/features/administrateurs/hooks/useAdmins'
import type { AdminAccount } from '@/features/administrateurs/types'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR')
}

export function AdministrateursPage() {
  const admins = useAdmins()
  const [createOpen, setCreateOpen] = useState(false)
  const [permissionsTarget, setPermissionsTarget] = useState<AdminAccount | undefined>()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Administrateurs</h1>
          <p className="text-muted-foreground text-sm">
            Gérez les mini-administrateurs et leurs permissions par module.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Nouvel administrateur
        </Button>
      </div>

      <Card>
        <CardContent>
          {admins.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !admins.data || admins.data.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun administrateur pour le moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.data.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.nom}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.actif ? 'default' : 'secondary'}>
                        {admin.actif ? 'Actif' : 'Désactivé'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.isSuperAdmin ? (
                        <Badge variant="outline" className="gap-1">
                          <ShieldCheck className="size-3" /> Super admin
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {admin.permissions.length} module(s) accordé(s)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(admin.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {!admin.isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPermissionsTarget(admin)}
                        >
                          <KeyRound /> Permissions
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateAdminDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AdminPermissionsSheet
        key={permissionsTarget?.id}
        open={permissionsTarget !== undefined}
        onOpenChange={(open) => !open && setPermissionsTarget(undefined)}
        admin={permissionsTarget}
      />
    </div>
  )
}
