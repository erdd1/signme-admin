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

import { useDeleteCelebration } from '../hooks/useDeleteCelebration'
import type { Celebration } from '../types'

interface DeleteCelebrationDialogProps {
  celebration: Celebration | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCelebrationDialog({
  celebration,
  open,
  onOpenChange,
}: DeleteCelebrationDialogProps) {
  const deleteCelebration = useDeleteCelebration()

  async function handleConfirm() {
    if (!celebration) return
    try {
      await deleteCelebration.mutateAsync(celebration.uuid)
      toast.success('Célébration supprimée avec succès.')
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de supprimer cette célébration.'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette célébration ?</AlertDialogTitle>
          <AlertDialogDescription>
            {celebration?.userNom} — {celebration?.label} du{' '}
            {celebration ? new Date(celebration.occursOn).toLocaleDateString('fr-FR') : ''}. Cette
            action est irréversible ; l'utilisateur ne verra plus cette entrée dans son historique.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={deleteCelebration.isPending}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
