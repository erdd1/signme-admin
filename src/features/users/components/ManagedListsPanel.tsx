import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/core/api/errors'
import { useChurches } from '@/features/users/hooks/useChurches'
import { useCreateGroupe } from '@/features/users/hooks/useCreateGroupe'
import { useCreateQuartier } from '@/features/users/hooks/useCreateQuartier'
import { useCreateVille } from '@/features/users/hooks/useCreateVille'
import { useDeleteGroupe } from '@/features/users/hooks/useDeleteGroupe'
import { useDeleteQuartier } from '@/features/users/hooks/useDeleteQuartier'
import { useDeleteVille } from '@/features/users/hooks/useDeleteVille'
import { useGroupes } from '@/features/users/hooks/useGroupes'
import { useQuartiers } from '@/features/users/hooks/useQuartiers'
import { useVilles } from '@/features/users/hooks/useVilles'
import type { Groupe, Quartier, Ville } from '@/features/users/types'

const ALL = '__all__'

interface LookupSectionProps<T extends { id: number; nom: string }> {
  title: string
  items: T[] | undefined
  isLoading: boolean
  isCreating: boolean
  isDeleting: boolean
  onCreate: (nom: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  renderLabel?: (item: T) => string
  extraField?: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    label: string
  }
}

function LookupSection<T extends { id: number; nom: string }>({
  title,
  items,
  isLoading,
  isCreating,
  isDeleting,
  onCreate,
  onDelete,
  renderLabel,
  extraField,
}: LookupSectionProps<T>) {
  const [nom, setNom] = useState('')

  async function handleCreate() {
    if (!nom.trim()) return
    try {
      await onCreate(nom.trim())
      setNom('')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleDelete(id: number) {
    try {
      await onDelete(id)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Nouveau nom..."
            value={nom}
            onChange={(event) => setNom(event.target.value)}
          />
          <Button
            size="icon"
            onClick={() => void handleCreate()}
            disabled={!nom.trim() || isCreating}
          >
            <Plus />
          </Button>
        </div>
        {extraField && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={extraField.checked}
              onCheckedChange={(checked) => extraField.onCheckedChange(checked === true)}
            />
            {extraField.label}
          </label>
        )}

        {isLoading && <Skeleton className="h-24 w-full" />}
        {items?.length === 0 && <p className="text-muted-foreground text-sm">Aucune entrée.</p>}
        {items && items.length > 0 && (
          <ul className="divide-y rounded-md border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>{renderLabel ? renderLabel(item) : item.nom}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void handleDelete(item.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function ManagedListsPanel() {
  const churches = useChurches()
  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [estDiaspora, setEstDiaspora] = useState(false)

  const quartiers = useQuartiers(churchId)
  const villes = useVilles(churchId)
  const groupes = useGroupes(churchId)

  const createQuartier = useCreateQuartier()
  const deleteQuartier = useDeleteQuartier()
  const createVille = useCreateVille()
  const deleteVille = useDeleteVille()
  const createGroupe = useCreateGroupe()
  const deleteGroupe = useDeleteGroupe()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Select
            value={churchId ? String(churchId) : ALL}
            onValueChange={(value) => setChurchId(value === ALL ? undefined : Number(value))}
          >
            <SelectTrigger className="w-64">
              <SelectValue>
                {(value: string) =>
                  value === ALL
                    ? 'Choisir une église'
                    : (churches.data?.find((c) => String(c.id) === value)?.nom ?? value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Choisir une église</SelectItem>
              {churches.data?.map((church) => (
                <SelectItem key={church.id} value={String(church.id)}>
                  {church.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!churchId && (
        <p className="text-muted-foreground text-sm">
          Sélectionnez une église pour gérer ses quartiers, villes et groupes.
        </p>
      )}

      {churchId && (
        <div className="grid gap-6 lg:grid-cols-3">
          <LookupSection<Quartier>
            title="Quartiers"
            items={quartiers.data}
            isLoading={quartiers.isLoading}
            isCreating={createQuartier.isPending}
            isDeleting={deleteQuartier.isPending}
            onCreate={async (nom) => {
              await createQuartier.mutateAsync({ nom, churchId })
              toast.success('Quartier créé avec succès.')
            }}
            onDelete={async (id) => {
              await deleteQuartier.mutateAsync(id)
              toast.success('Quartier supprimé avec succès.')
            }}
          />
          <LookupSection<Ville>
            title="Villes"
            items={villes.data}
            isLoading={villes.isLoading}
            isCreating={createVille.isPending}
            isDeleting={deleteVille.isPending}
            renderLabel={(v) => `${v.nom}${v.estDiaspora ? ' (diaspora)' : ''}`}
            extraField={{
              checked: estDiaspora,
              onCheckedChange: setEstDiaspora,
              label: 'Diaspora (hors Cameroun)',
            }}
            onCreate={async (nom) => {
              await createVille.mutateAsync({ nom, estDiaspora, churchId })
              toast.success('Ville créée avec succès.')
              setEstDiaspora(false)
            }}
            onDelete={async (id) => {
              await deleteVille.mutateAsync(id)
              toast.success('Ville supprimée avec succès.')
            }}
          />
          <LookupSection<Groupe>
            title="Groupes"
            items={groupes.data}
            isLoading={groupes.isLoading}
            isCreating={createGroupe.isPending}
            isDeleting={deleteGroupe.isPending}
            onCreate={async (nom) => {
              await createGroupe.mutateAsync({ nom, churchId })
              toast.success('Groupe créé avec succès.')
            }}
            onDelete={async (id) => {
              await deleteGroupe.mutateAsync(id)
              toast.success('Groupe supprimé avec succès.')
            }}
          />
        </div>
      )}
    </div>
  )
}
