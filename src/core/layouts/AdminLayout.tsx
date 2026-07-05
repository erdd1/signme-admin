import {
  ChevronRight,
  Church,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Newspaper,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useLogout } from '@/features/auth/hooks/useLogin'
import { useAuthStore } from '@/features/auth/store/authStore'
import { cn } from '@/lib/utils'

const topNavItems = [
  { label: 'Tableau de bord', to: '/', icon: LayoutDashboard },
  { label: 'Églises', to: '/eglises', icon: Church },
  { label: 'Utilisateurs', to: '/utilisateurs', icon: Users },
  { label: 'Publications', to: '/publications', icon: Newspaper },
]

const bottomNavItems = [
  { label: 'Mon compte', to: '/compte', icon: UserCog },
  { label: 'Sécurité', to: '/securite', icon: ShieldAlert },
]

const paymentsSubItems = [
  { label: 'Signatures', to: '/paiements/signatures' },
  { label: 'Contributions', to: '/paiements/contributions' },
]

export function AdminLayout() {
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clear)
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const [paymentsOpen, setPaymentsOpen] = useState(location.pathname.startsWith('/paiements'))

  async function handleLogout() {
    try {
      await logout.mutateAsync()
    } catch {
      // Déconnexion locale malgré tout : mieux vaut un faux positif réseau
      // qu'un admin bloqué connecté.
      toast.error('La déconnexion côté serveur a échoué, session locale effacée.')
    } finally {
      clearSession()
      void navigate('/login', { replace: true })
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <ShieldCheck className="text-primary size-5" />
            <span className="text-sm font-semibold">SignMe Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {topNavItems.map(({ label, to, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton render={<NavLink to={to} end />}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setPaymentsOpen((open) => !open)}>
                    <CreditCard />
                    <span>Paiements</span>
                    <ChevronRight
                      className={cn('ml-auto transition-transform', paymentsOpen && 'rotate-90')}
                    />
                  </SidebarMenuButton>
                  {paymentsOpen && (
                    <SidebarMenuSub>
                      {paymentsSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.to}>
                          <SidebarMenuSubButton render={<NavLink to={item.to} />}>
                            <span>{item.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>

                {bottomNavItems.map(({ label, to, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton render={<NavLink to={to} end />}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            {user && <span className="text-muted-foreground text-sm">{user.nom}</span>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleLogout()}
              disabled={logout.isPending}
            >
              <LogOut />
              Se déconnecter
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
