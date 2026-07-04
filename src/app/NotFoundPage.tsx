import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="text-muted-foreground">Cette page n'existe pas.</p>
      <Button render={<Link to="/" />}>Retour au tableau de bord</Button>
    </div>
  )
}
