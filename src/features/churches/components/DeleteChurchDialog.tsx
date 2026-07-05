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
import { useDeleteChurch } from '@/features/churches/hooks/useDeleteChurch'
import type { Church } from '@/features/churches/types'

interface DeleteChurchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  church: Church | undefined
  onDeleted?: () => void
}

export function DeleteChurchDialog({
  open,
  onOpenChange,
  church,
  onDeleted,
}: DeleteChurchDialogProps) {
  const deleteChurch = useDeleteChurch()

  async function handleConfirm() {
    if (!church) return
    try {
      await deleteChurch.mutateAsync(church.id)
      toast.success('Église supprimée avec succès.')
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de supprimer cette église.'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer {church?.nom} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Une église ayant encore des membres actifs ne peut pas
            être supprimée — désactivez ou réaffectez ses membres d'abord.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={deleteChurch.isPending}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
