import { Badge } from '@/components/ui/badge'

import type { SortieStatut } from '../types'

const LABELS: Record<SortieStatut, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
}

const VARIANTS: Record<SortieStatut, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  approved: 'default', // vert via default or you can customize
  rejected: 'destructive',
}

export function SortieStatusBadge({ statut }: { statut: SortieStatut }) {
  // To make pending orange we could use inline style or tailwind classes,
  // but let's stick to Shadcn variant approach. 'outline' is typically border color.
  // We can add a custom className for orange if needed.
  return (
    <Badge
      variant={VARIANTS[statut]}
      className={
        statut === 'pending'
          ? 'border-orange-500 text-orange-500'
          : statut === 'approved'
            ? 'bg-green-600 hover:bg-green-700'
            : ''
      }
    >
      {LABELS[statut]}
    </Badge>
  )
}
