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
import { useRestoreBackup } from '@/features/systeme/hooks/useRestoreBackup'
import type { Backup } from '@/features/systeme/types'

interface RestoreBackupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  backup: Backup | undefined
}

export function RestoreBackupDialog({ open, onOpenChange, backup }: RestoreBackupDialogProps) {
  const restoreBackup = useRestoreBackup()

  async function handleConfirm() {
    if (!backup) return
    try {
      await restoreBackup.mutateAsync(backup.uuid)
      toast.success(
        'Restauration lancée en arrière-plan. Une sauvegarde de sécurité a été créée avant toute modification.',
      )
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Impossible de lancer la restauration.'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restaurer la base de données ?</AlertDialogTitle>
          <AlertDialogDescription>
            Toutes les données actuelles seront REMPLACÉES par celles de la sauvegarde du{' '}
            {backup && new Date(backup.createdAt).toLocaleString('fr-FR')} ({backup?.filename}).
            Cette action est destructrice. Une sauvegarde de sécurité de l'état actuel sera
            automatiquement créée avant la restauration, mais l'opération peut prendre plusieurs
            minutes et ne peut pas être annulée une fois lancée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={restoreBackup.isPending}
          >
            Restaurer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
