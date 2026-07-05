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
import { useDeletePublication } from '@/features/publications/hooks/useDeletePublication'
import type { Publication } from '@/features/publications/types'

interface DeletePublicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publication: Publication | undefined
}

export function DeletePublicationDialog({
  open,
  onOpenChange,
  publication,
}: DeletePublicationDialogProps) {
  const deletePublication = useDeletePublication()

  async function handleConfirm() {
    if (!publication) return
    try {
      await deletePublication.mutateAsync(publication.id)
      toast.success('Publication supprimée avec succès.')
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de supprimer cette publication.'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {publication?.titre} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Les membres qui suivent déjà cette publication ne la
            verront plus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={deletePublication.isPending}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
