import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorMessage } from '@/core/api/errors'
import { useAdminResources } from '@/features/administrateurs/hooks/useAdminResources'
import { useUpdateAdminPermissions } from '@/features/administrateurs/hooks/useUpdateAdminPermissions'
import type { AdminAccount } from '@/features/administrateurs/types'
import type { AdminPermissionGrant, AdminResourceKey } from '@/features/auth/types'

interface AdminPermissionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin: AdminAccount | undefined
}

type PermissionAction = 'can_view' | 'can_create' | 'can_update' | 'can_delete'

const actionColumns: { key: PermissionAction; label: string }[] = [
  { key: 'can_view', label: 'Lire' },
  { key: 'can_create', label: 'Créer' },
  { key: 'can_update', label: 'Modifier' },
  { key: 'can_delete', label: 'Supprimer' },
]

const emptyGrant = (resource: AdminResourceKey): AdminPermissionGrant => ({
  resource,
  can_view: false,
  can_create: false,
  can_update: false,
  can_delete: false,
})

/**
 * Remonté (via `key={admin?.id}` côté appelant) à chaque changement de
 * cible — `overrides` ne contient donc jamais des cases cochées venant
 * d'un administrateur précédemment édité. Aucun effet nécessaire : la
 * grille effective se calcule directement au rendu à partir des
 * permissions actuelles de l'admin, jamais depuis un état initialisé une
 * seule fois.
 */
export function AdminPermissionsSheet({ open, onOpenChange, admin }: AdminPermissionsSheetProps) {
  const resources = useAdminResources()
  const updatePermissions = useUpdateAdminPermissions()
  const [overrides, setOverrides] = useState<
    Partial<Record<AdminResourceKey, AdminPermissionGrant>>
  >({})

  function effectiveGrant(resource: AdminResourceKey): AdminPermissionGrant {
    return (
      overrides[resource] ??
      admin?.permissions.find((p) => p.resource === resource) ??
      emptyGrant(resource)
    )
  }

  function toggle(resource: AdminResourceKey, action: PermissionAction, checked: boolean) {
    setOverrides((prev) => ({
      ...prev,
      [resource]: { ...effectiveGrant(resource), [action]: checked },
    }))
  }

  async function handleSave() {
    if (!admin || !resources.data) return
    try {
      const permissions = resources.data.map((r) => effectiveGrant(r.key))
      await updatePermissions.mutateAsync({ id: admin.id, permissions })
      toast.success('Permissions mises à jour.')
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de mettre à jour les permissions.'))
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Permissions — {admin?.nom}</SheetTitle>
          <SheetDescription>
            Aucune case cochée sur un module = aucun accès à ce module, y compris en lecture.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-4">
          {resources.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  {actionColumns.map((col) => (
                    <TableHead key={col.key} className="text-center">
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.data?.map((resource) => (
                  <TableRow key={resource.key}>
                    <TableCell>{resource.label}</TableCell>
                    {actionColumns.map((col) => (
                      <TableCell key={col.key} className="text-center">
                        <Checkbox
                          checked={effectiveGrant(resource.key)[col.key]}
                          onCheckedChange={(checked) =>
                            toggle(resource.key, col.key, checked === true)
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={() => void handleSave()} disabled={updatePermissions.isPending}>
            Enregistrer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
