import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agents', label: 'Agentes', icon: Users },
  { path: '/teams', label: 'Equipes', icon: UsersRound },
  { path: '/conversations', label: 'Conversas', icon: MessageSquare },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/feedback', label: 'Avaliações', icon: Star },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()
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
    <div className="flex h-16 items-center gap-2 border-b px-6">
      <div className="h-8 w-8 rounded-lg bg-primary" />
      <span className="font-semibold">Performance</span>
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
