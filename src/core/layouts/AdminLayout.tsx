import {
  ChevronRight,
  Church,
  CreditCard,
  FileSignature,
  HandCoins,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PartyPopper,
  ServerCog,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  Wallet,
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
import { hasPermission } from '@/features/auth/permissions'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { AdminResourceKey } from '@/features/auth/types'
import { cn } from '@/lib/utils'

const topNavItems: {
  label: string
  to: string
  icon: typeof Church
  resource: AdminResourceKey | null
}[] = [
  { label: 'Tableau de bord', to: '/', icon: LayoutDashboard, resource: null },
  { label: 'Églises', to: '/eglises', icon: Church, resource: 'churches' },
  { label: 'Utilisateurs', to: '/utilisateurs', icon: Users, resource: 'users' },
  { label: 'Publications', to: '/publications', icon: Newspaper, resource: 'publications' },
  { label: 'Cartes de signature', to: '/signatures', icon: FileSignature, resource: 'signatures' },
  { label: 'Événements', to: '/evenements', icon: HandCoins, resource: 'evenements' },
  {
    label: 'Sorties financières',
    to: '/sorties-financieres',
    icon: Wallet,
    resource: 'sorties_financieres',
  },
  {
    label: "Désignations d'anciens",
    to: '/anciens-designations',
    icon: UserCheck,
    resource: 'anciens_designations',
  },
  { label: 'Célébrations', to: '/celebrations', icon: PartyPopper, resource: 'celebrations' },
]

const bottomNavItems: { label: string; to: string; icon: typeof UserCog }[] = [
  { label: 'Mon compte', to: '/compte', icon: UserCog },
  { label: 'Sécurité', to: '/securite', icon: ShieldAlert },
]

const superAdminNavItems: { label: string; to: string; icon: typeof KeyRound }[] = [
  { label: 'Administrateurs', to: '/administrateurs', icon: KeyRound },
  { label: 'Système', to: '/systeme', icon: ServerCog },
]

const paymentsSubItems: { label: string; to: string; resource: AdminResourceKey }[] = [
  { label: 'Signatures', to: '/paiements/signatures', resource: 'signatures' },
  { label: 'Contributions', to: '/paiements/contributions', resource: 'evenements' },
]

export function AdminLayout() {
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clear)
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const [paymentsOpen, setPaymentsOpen] = useState(location.pathname.startsWith('/paiements'))

  const visibleTopNavItems = topNavItems.filter(
    (item) => item.resource === null || hasPermission(user, item.resource, 'view'),
  )
  const visiblePaymentsSubItems = paymentsSubItems.filter((item) =>
    hasPermission(user, item.resource, 'view'),
  )

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
                {visibleTopNavItems.map(({ label, to, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton render={<NavLink to={to} end />}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {visiblePaymentsSubItems.length > 0 && (
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
                        {visiblePaymentsSubItems.map((item) => (
                          <SidebarMenuSubItem key={item.to}>
                            <SidebarMenuSubButton render={<NavLink to={item.to} />}>
                              <span>{item.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                )}

                {bottomNavItems.map(({ label, to, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton render={<NavLink to={to} end />}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {user?.isSuperAdmin &&
                  superAdminNavItems.map(({ label, to, icon: Icon }) => (
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
