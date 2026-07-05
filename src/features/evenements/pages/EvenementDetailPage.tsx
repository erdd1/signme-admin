import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/core/api/errors'
import { CancelScheduledEvenementDialog } from '@/features/evenements/components/CancelScheduledEvenementDialog'
import { EvenementContributionsTab } from '@/features/evenements/components/EvenementContributionsTab'
import { EvenementFormDialog } from '@/features/evenements/components/EvenementFormDialog'
import { EvenementStatusBadge } from '@/features/evenements/components/EvenementStatusBadge'
import { useArchiverEvenement } from '@/features/evenements/hooks/useArchiverEvenement'
import { useDesarchiverEvenement } from '@/features/evenements/hooks/useDesarchiverEvenement'
import { useEvenement } from '@/features/evenements/hooks/useEvenement'
import { usePublishEvenement } from '@/features/evenements/hooks/usePublishEvenement'
import { useTerminerEvenement } from '@/features/evenements/hooks/useTerminerEvenement'

export function EvenementDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const evenement = useEvenement(uuid)

  const [formOpen, setFormOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const publish = usePublishEvenement()
  const terminer = useTerminerEvenement()
  const archiver = useArchiverEvenement()
  const desarchiver = useDesarchiverEvenement()

  async function handlePublish() {
    try {
      await publish.mutateAsync(uuid!)
      toast.success('Événement publié avec succès.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleTerminer() {
    try {
      await terminer.mutateAsync(uuid!)
      toast.success('Événement terminé avec succès.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleArchiver() {
    try {
      await archiver.mutateAsync(uuid!)
      toast.success('Événement archivé avec succès.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleDesarchiver() {
    try {
      await desarchiver.mutateAsync(uuid!)
      toast.success('Événement désarchivé avec succès.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link to="/evenements" />}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-semibold">{evenement.data?.titre ?? 'Événement'}</h1>
        {evenement.data && <EvenementStatusBadge statut={evenement.data.statut} />}
      </div>

      {evenement.isLoading && <Skeleton className="h-48 w-full" />}

      {evenement.data && (
        <>
          {evenement.data.imageUrl && (
            <img
              src={evenement.data.imageUrl}
              alt={evenement.data.titre}
              className="max-h-64 w-full rounded-lg object-cover"
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{evenement.data.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Église : </span>
                {evenement.data.church.nom}
              </p>
              <p>
                <span className="text-muted-foreground">Auteur : </span>
                {evenement.data.auteur.nom}
              </p>
              <p>
                <span className="text-muted-foreground">Date de début : </span>
                {evenement.data.dateDebut}
              </p>
              <p>
                <span className="text-muted-foreground">Date de fin : </span>
                {evenement.data.dateFin ? evenement.data.dateFin.slice(0, 10) : '—'}
              </p>
              {evenement.data.statut === 'termine' &&
                evenement.data.joursAvantArchivage !== null && (
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Archivage automatique dans : </span>
                    {evenement.data.joursAvantArchivage} jour(s)
                  </p>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collecte</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {evenement.data.objectifMontant ? (
                <>
                  <Progress value={evenement.data.pourcentageObjectif ?? 0} />
                  <p className="text-sm">
                    {evenement.data.montantCollecte} / {evenement.data.objectifMontant} FCFA (
                    {evenement.data.pourcentageObjectif ?? 0}%)
                  </p>
                </>
              ) : (
                <p className="text-sm">
                  {evenement.data.montantCollecte} FCFA collectés (pas d'objectif défini)
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                {evenement.data.nombreContributions} contribution(s)
                {evenement.data.nombreContributeurs !== null &&
                  ` — ${evenement.data.nombreContributeurs} contributeur(s) distinct(s)`}
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {evenement.data.statut === 'brouillon' && (
              <>
                <Button onClick={() => void handlePublish()} disabled={publish.isPending}>
                  Publier
                </Button>
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  Modifier
                </Button>
              </>
            )}
            {evenement.data.statut === 'planifie' && (
              <>
                <Button onClick={() => void handlePublish()} disabled={publish.isPending}>
                  Publier maintenant
                </Button>
                <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                  Annuler
                </Button>
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  Modifier
                </Button>
              </>
            )}
            {evenement.data.statut === 'actif' && (
              <>
                <Button onClick={() => void handleTerminer()} disabled={terminer.isPending}>
                  Terminer
                </Button>
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  Modifier
                </Button>
              </>
            )}
            {evenement.data.statut === 'termine' && (
              <Button onClick={() => void handleArchiver()} disabled={archiver.isPending}>
                Archiver
              </Button>
            )}
            {evenement.data.statut === 'archive' && (
              <Button onClick={() => void handleDesarchiver()} disabled={desarchiver.isPending}>
                Désarchiver
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <EvenementContributionsTab uuid={evenement.data.uuid} />
            </CardContent>
          </Card>

          <EvenementFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            evenement={evenement.data}
          />
          <CancelScheduledEvenementDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            evenement={evenement.data}
            onCancelled={() => void navigate('/evenements', { replace: true })}
          />
        </>
      )}
    </div>
  )
}
