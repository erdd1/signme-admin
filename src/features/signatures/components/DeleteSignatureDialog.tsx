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
import { useDeleteSignature } from '@/features/signatures/hooks/useDeleteSignature'
import type { Signature } from '@/features/signatures/types'

interface DeleteSignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  signature: Signature | undefined
}

export function DeleteSignatureDialog({
  open,
  onOpenChange,
  signature,
}: DeleteSignatureDialogProps) {
  const deleteSignature = useDeleteSignature()

  async function handleConfirm() {
    if (!signature) return
    try {
      await deleteSignature.mutateAsync(signature.id)
      toast.success('Signature supprimée avec succès.')
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de supprimer cette signature.'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer la signature de {signature?.nomParoissien} ({signature?.month}) ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le membre n'aura plus cette signature enregistrée sur sa
            carte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={deleteSignature.isPending}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
