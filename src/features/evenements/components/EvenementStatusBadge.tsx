import { Badge } from '@/components/ui/badge'
import type { EvenementStatut } from '@/features/evenements/types'

const LABELS: Record<EvenementStatut, string> = {
  brouillon: 'Brouillon',
  planifie: 'Planifié',
  actif: 'Actif',
  termine: 'Terminé',
  archive: 'Archivé',
}

const VARIANTS: Record<EvenementStatut, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  brouillon: 'outline',
  planifie: 'secondary',
  actif: 'default',
  termine: 'secondary',
  archive: 'destructive',
}

export function EvenementStatusBadge({ statut }: { statut: EvenementStatut }) {
  return <Badge variant={VARIANTS[statut]}>{LABELS[statut]}</Badge>
}
