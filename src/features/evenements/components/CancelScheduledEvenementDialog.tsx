import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getApiErrorMessage } from '@/core/api/errors'
import { useCancelScheduledEvenement } from '@/features/evenements/hooks/useCancelScheduledEvenement'
import type { Evenement } from '@/features/evenements/types'

interface CancelScheduledEvenementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evenement: Evenement | undefined
  onCancelled?: () => void
}

export function CancelScheduledEvenementDialog({
  open,
  onOpenChange,
  evenement,
  onCancelled,
}: CancelScheduledEvenementDialogProps) {
  const cancelScheduled = useCancelScheduledEvenement()

  async function handleConfirm() {
    if (!evenement) return
    try {
      await cancelScheduled.mutateAsync(evenement.uuid)
      toast.success('Événement supprimé avec succès.')
      onOpenChange(false)
      onCancelled?.()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d'annuler cet événement."))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {evenement?.titre} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cet événement planifié n'a jamais été publié — l'annuler le supprime définitivement
            (aucune restauration possible). Il n'existe aucune autre façon de supprimer un événement
            une fois publié, pour des raisons de traçabilité.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={cancelScheduled.isPending}
          >
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
