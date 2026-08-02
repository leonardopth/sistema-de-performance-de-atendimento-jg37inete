import { useState } from 'react'
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/use-auth'
import { getUserRole, canAccessPage, getDefaultPage, type NavItem } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NotificationCenter } from '@/components/NotificationCenter'
import logoImg from '@/assets/image-7e342.png'
import {
  LayoutDashboard,
  Users,
  UsersRound,
  MessageSquare,
  Target,
  Star,
  Moon,
  Sun,
  Menu,
  LogOut,
  FileText,
  UserCircle,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const allNavItems: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'gestor', 'supervisor'],
  },
  { path: '/agents', label: 'Agentes', icon: Users, roles: ['admin', 'gestor', 'supervisor'] },
  { path: '/teams', label: 'Equipes', icon: UsersRound, roles: ['admin', 'gestor', 'supervisor'] },
  {
    path: '/conversations',
    label: 'Conversas',
    icon: MessageSquare,
    roles: ['admin', 'gestor', 'supervisor'],
  },
  { path: '/goals', label: 'Metas', icon: Target, roles: ['admin', 'gestor', 'supervisor'] },
  { path: '/feedback', label: 'Avaliações', icon: Star, roles: ['admin', 'gestor', 'supervisor'] },
  {
    path: '/reports',
    label: 'Relatórios',
    icon: FileText,
    roles: ['admin', 'gestor', 'supervisor'],
  },
  {
    path: '/my-performance',
    label: 'Minha Performance',
    icon: UserCircle,
    roles: ['admin', 'gestor', 'supervisor', 'agente'],
  },
  { path: '/users', label: 'Usuários', icon: UserCog, roles: ['admin'] },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const role = getUserRole(user)
  const navItems = allNavItems.filter((item) => item.roles.includes(role))

  if (!canAccessPage(user, location.pathname)) {
    return <Navigate to={getDefaultPage(user)} replace />
  }

  const userName = (user?.name as string) || 'Usuário'

  const SidebarNav = () => (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )

  const Logo = () => (
    <div className="flex h-16 items-center gap-2 border-b px-4 bg-slate-950">
      <img src={logoImg} alt="Rextur Advance" className="h-8 w-auto object-contain" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <Logo />
        <SidebarNav />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Logo />
          <SidebarNav />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="hidden h-5 w-5 dark:block" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:block">{userName}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
