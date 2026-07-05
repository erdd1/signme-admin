import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AssignPastorDialog } from '@/features/churches/components/AssignPastorDialog'
import { ChurchFormDialog } from '@/features/churches/components/ChurchFormDialog'
import { DeleteChurchDialog } from '@/features/churches/components/DeleteChurchDialog'
import { useChurch } from '@/features/churches/hooks/useChurch'

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

export function ChurchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const churchId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const church = useChurch(churchId)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link to="/eglises" />}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-semibold">{church.data?.nom ?? 'Église'}</h1>
      </div>

      {church.isLoading && <Skeleton className="h-48 w-full" />}

      {church.data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Membres actifs" value={church.data.stats.totalMembres} />
              <StatCard label="Anciens" value={church.data.stats.totalAnciens} />
              <StatCard label="Paroissiens" value={church.data.stats.totalParoissiens} />
              <StatCard
                label="Signatures ce mois"
                value={church.data.stats.signaturesMoisCourant}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Ville : </span>
                {church.data.ville}
              </p>
              <p>
                <span className="text-muted-foreground">Région : </span>
                {church.data.region ?? '—'}
              </p>
              <p>
                <span className="text-muted-foreground">Adresse : </span>
                {church.data.adresse ?? '—'}
              </p>
              <p>
                <span className="text-muted-foreground">Téléphone : </span>
                {church.data.telephone ?? '—'}
              </p>
              <p>
                <span className="text-muted-foreground">Email : </span>
                {church.data.email ?? '—'}
              </p>
              <p>
                <span className="text-muted-foreground">Pasteur : </span>
                {church.data.pastorNom ?? 'Aucun'}
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setAssignOpen(true)}>
              Assigner un pasteur
            </Button>
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              Modifier
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              Supprimer
            </Button>
          </div>

          <ChurchFormDialog open={formOpen} onOpenChange={setFormOpen} church={church.data} />
          <DeleteChurchDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            church={church.data}
            onDeleted={() => void navigate('/eglises', { replace: true })}
          />
          <AssignPastorDialog open={assignOpen} onOpenChange={setAssignOpen} church={church.data} />
        </>
      )}
    </div>
  )
}
