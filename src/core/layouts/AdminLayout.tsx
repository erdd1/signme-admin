import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'

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
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/features/auth/store/authStore'

const navItems = [{ label: 'Tableau de bord', to: '/', icon: LayoutDashboard }]

export function AdminLayout() {
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clear)
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    void navigate('/login', { replace: true })
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
                {navItems.map(({ label, to, icon: Icon }) => (
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
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
