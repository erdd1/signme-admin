import { Badge } from '@/components/ui/badge'
import type { SignatureStatus } from '@/features/signatures/types'

const LABELS: Record<SignatureStatus, string> = {
  completed: 'Complété',
  pending: 'En attente',
  failed: 'Échoué',
}

const VARIANTS: Record<SignatureStatus, 'default' | 'secondary' | 'destructive'> = {
  completed: 'default',
  pending: 'secondary',
  failed: 'destructive',
}

export function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>
}
