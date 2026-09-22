import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useApproveSortie } from '../hooks/useApproveSortie'
import type { SortieFinanciere } from '../types'

interface SortieApproveDialogProps {
  sortie: SortieFinanciere | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SortieApproveDialog({ sortie, open, onOpenChange }: SortieApproveDialogProps) {
  const approve = useApproveSortie()

  async function handleApprove() {
    if (!sortie) return
    try {
      await approve.mutateAsync(sortie.uuid)
      toast.success('Sortie de frais validée avec succès')
      onOpenChange(false)
    } catch {
      toast.error('Erreur lors de la validation')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Valider la sortie de frais</DialogTitle>
          <DialogDescription>
            {sortie && (
              <>
                Voulez-vous vraiment valider cette sortie de frais d'un montant de{' '}
                <strong>{sortie.montant.toLocaleString('fr-FR')} FCFA</strong> ?
                <br />
                <br />
                Description : <em>{sortie.description}</em>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => void handleApprove()}
            disabled={approve.isPending}
          >
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
