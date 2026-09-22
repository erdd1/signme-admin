import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

import { useRejectSortie } from '../hooks/useRejectSortie'
import type { SortieFinanciere } from '../types'

interface SortieRejectDialogProps {
  sortie: SortieFinanciere | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SortieRejectDialog({ sortie, open, onOpenChange }: SortieRejectDialogProps) {
  const [motif, setMotif] = useState('')
  const reject = useRejectSortie()

  async function handleReject() {
    if (!sortie || !motif.trim()) return
    try {
      await reject.mutateAsync({ uuid: sortie.uuid, motif })
      toast.success('Sortie de frais rejetée avec succès')
      setMotif('')
      onOpenChange(false)
    } catch {
      toast.error('Erreur lors du rejet')
    }
  }

  // Clear state when dialog is closed
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setMotif('')
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter la sortie de frais</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Motif du rejet (obligatoire)"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleReject()}
            disabled={reject.isPending || !motif.trim()}
          >
            Rejeter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
