import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApiErrorMessage } from '@/core/api/errors'
import { useAssignPastor } from '@/features/churches/hooks/useAssignPastor'
import { usePastorCandidates } from '@/features/churches/hooks/usePastorCandidates'
import type { Church } from '@/features/churches/types'

interface AssignPastorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  church: Church | undefined
}

export function AssignPastorDialog({ open, onOpenChange, church }: AssignPastorDialogProps) {
  const candidates = usePastorCandidates()
  const assignPastor = useAssignPastor()
  const [pastorId, setPastorId] = useState<string>('')

  async function handleConfirm() {
    if (!church || !pastorId) return
    try {
      await assignPastor.mutateAsync({ churchId: church.id, pastorId: Number(pastorId) })
      toast.success('Pasteur assigné avec succès.')
      onOpenChange(false)
      setPastorId('')
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d'assigner ce pasteur."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner un pasteur — {church?.nom}</DialogTitle>
          <DialogDescription>
            Un pasteur déjà affecté ailleurs sera déplacé vers cette église.
          </DialogDescription>
        </DialogHeader>

        <Select value={pastorId} onValueChange={(value) => setPastorId(value!)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => {
                const candidate = candidates.data?.find((c) => String(c.id) === value)
                return candidate ? candidate.nom : 'Choisir un pasteur'
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {candidates.data?.map((candidate) => (
              <SelectItem key={candidate.id} value={String(candidate.id)}>
                {candidate.nom}
                {candidate.churchNom ? ` (actuellement : ${candidate.churchNom})` : ''}
              </SelectItem>
            ))}
            {candidates.data?.length === 0 && (
              <p className="text-muted-foreground p-2 text-sm">Aucun pasteur trouvé.</p>
            )}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            disabled={!pastorId || assignPastor.isPending}
          >
            Assigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
