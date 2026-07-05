import { Badge } from '@/components/ui/badge'
import type { PublicationType } from '@/features/publications/types'

const LABELS: Record<PublicationType, string> = {
  annonce: 'Annonce',
  meditation: 'Méditation',
}

const VARIANTS: Record<PublicationType, 'default' | 'secondary'> = {
  annonce: 'secondary',
  meditation: 'default',
}

export function PublicationTypeBadge({ type }: { type: PublicationType }) {
  return <Badge variant={VARIANTS[type]}>{LABELS[type]}</Badge>
}
