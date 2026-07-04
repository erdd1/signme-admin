import { Toaster } from '@/components/ui/sonner'

import { QueryProvider } from './providers/QueryProvider'
import { AppRouter } from './router'

export function App() {
  return (
    <QueryProvider>
      <AppRouter />
      <Toaster />
    </QueryProvider>
  )
}
