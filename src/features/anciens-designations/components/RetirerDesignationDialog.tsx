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
import { useRetirerDesignation } from '@/features/anciens-designations/hooks/useRetirerDesignation'
import type { AncienDesigne } from '@/features/anciens-designations/types'

interface RetirerDesignationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  designe: AncienDesigne | undefined
}

export function RetirerDesignationDialog({
  open,
  onOpenChange,
  designe,
}: RetirerDesignationDialogProps) {
  const retirerDesignation = useRetirerDesignation()

  async function handleConfirm() {
    if (!designe) return
    try {
      await retirerDesignation.mutateAsync(designe.designation_id)
      toast.success('Désignation retirée avec succès.')
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de retirer cette désignation.'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retirer {designe?.nom} du service ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action retire immédiatement l'accès à la signature présentielle pour cet ancien
            sur cette période. Il pourra être redésigné ultérieurement si besoin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={retirerDesignation.isPending}
          >
            Retirer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
