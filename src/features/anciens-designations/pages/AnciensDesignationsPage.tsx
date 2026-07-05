import { RefreshCw, UserMinus, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { getApiErrorMessage } from '@/core/api/errors'
import { DesignerAncienDialog } from '@/features/anciens-designations/components/DesignerAncienDialog'
import { RetirerDesignationDialog } from '@/features/anciens-designations/components/RetirerDesignationDialog'
import { useAnciensDesignations } from '@/features/anciens-designations/hooks/useAnciensDesignations'
import { useSyncDesignationFlags } from '@/features/anciens-designations/hooks/useSyncDesignationFlags'
import type { AncienDesigne, AncienNonDesigne } from '@/features/anciens-designations/types'
import { useChurches } from '@/features/users/hooks/useChurches'

const ALL = '__all__'

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function AnciensDesignationsPage() {
  const churches = useChurches()
  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [month, setMonth] = useState(currentMonthKey())
  const mois = Number(month.split('-')[1])
  const annee = Number(month.split('-')[0])

  const designations = useAnciensDesignations({ mois, annee, churchId })
  const sync = useSyncDesignationFlags()

  const [designerOpen, setDesignerOpen] = useState(false)
  const [targetAncien, setTargetAncien] = useState<AncienNonDesigne | undefined>()
  const [retirerOpen, setRetirerOpen] = useState(false)
  const [targetDesigne, setTargetDesigne] = useState<AncienDesigne | undefined>()

  async function handleSync() {
    if (!churchId) return
    try {
      await sync.mutateAsync(churchId)
      toast.success('Statuts synchronisés avec succès.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de synchroniser les statuts.'))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Désignations d'anciens</h1>
        <Button
          variant="outline"
          onClick={() => void handleSync()}
          disabled={sync.isPending || !churchId}
        >
          <RefreshCw /> Synchroniser les statuts
        </Button>
      </div>

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
          <Input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="w-40"
          />
        </CardContent>
      </Card>

      {!churchId && <p className="text-muted-foreground text-sm">Sélectionnez une église.</p>}

      {churchId && (
        <>
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-3 text-lg font-medium">
                Anciens désignés ({designations.data?.total_designes ?? 0})
              </h2>
              {designations.isLoading && <Skeleton className="h-40 w-full" />}
              {designations.data && designations.data.designes.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Aucun ancien désigné pour cette période.
                </p>
              )}
              {designations.data && designations.data.designes.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Disponibilité</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designations.data.designes.map((d) => (
                      <TableRow key={d.designation_id}>
                        <TableCell className="font-medium">{d.nom}</TableCell>
                        <TableCell>{d.telephone ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{d.disponibilite.resume}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTargetDesigne(d)
                              setRetirerOpen(true)
                            }}
                          >
                            <UserMinus /> Retirer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-3 text-lg font-medium">
                Anciens non désignés ({designations.data?.non_designes.length ?? 0})
              </h2>
              {designations.isLoading && <Skeleton className="h-40 w-full" />}
              {designations.data && designations.data.non_designes.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Tous les anciens de cette église sont désignés pour cette période.
                </p>
              )}
              {designations.data && designations.data.non_designes.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designations.data.non_designes.map((nd) => (
                      <TableRow key={nd.id}>
                        <TableCell className="font-medium">{nd.nom}</TableCell>
                        <TableCell>{nd.telephone ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTargetAncien(nd)
                              setDesignerOpen(true)
                            }}
                          >
                            <UserPlus /> Désigner
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <DesignerAncienDialog
        open={designerOpen}
        onOpenChange={setDesignerOpen}
        ancien={targetAncien}
        mois={mois}
        annee={annee}
        churchId={churchId}
      />
      <RetirerDesignationDialog
        open={retirerOpen}
        onOpenChange={setRetirerOpen}
        designe={targetDesigne}
      />
    </div>
  )
}
