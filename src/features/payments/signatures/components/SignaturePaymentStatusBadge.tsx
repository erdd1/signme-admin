import { Badge } from '@/components/ui/badge'
import type { SignaturePaymentStatus } from '@/features/payments/signatures/types'

const LABELS: Record<SignaturePaymentStatus, string> = {
  completed: 'Complété',
  pending: 'En attente',
  failed: 'Échoué',
}

const VARIANTS: Record<SignaturePaymentStatus, 'default' | 'secondary' | 'destructive'> = {
  completed: 'default',
  pending: 'secondary',
  failed: 'destructive',
}

export function SignaturePaymentStatusBadge({ status }: { status: SignaturePaymentStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>
}
