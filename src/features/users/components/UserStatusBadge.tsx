import { Badge } from '@/components/ui/badge'

export function UserStatusBadge({ actif }: { actif: boolean }) {
  return <Badge variant={actif ? 'default' : 'destructive'}>{actif ? 'Actif' : 'Inactif'}</Badge>
}
