import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  PieChart,
  Wallet,
  Settings,
  LogOut,
  Bell,
  Activity,
} from 'lucide-react'
import { Button } from './ui/button'

export default function Layout() {
  const { role, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (!role && location.pathname !== '/login') {
    navigate('/login')
    return null
  }

  if (location.pathname === '/login') {
    return <Outlet />
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getMenu = () => {
    if (role === 'admin') {
      return [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { title: 'Clínicas', icon: HeartPulse, path: '/clinics' },
        { title: 'Relatórios', icon: PieChart, path: '/reports' },
        { title: 'Configurações', icon: Settings, path: '/settings' },
      ]
    }
    if (role === 'clinic') {
      return [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { title: 'Pacientes', icon: Users, path: '/patients' },
        { title: 'CRM', icon: PieChart, path: '/crm' },
        { title: 'Financeiro', icon: Wallet, path: '/financial' },
      ]
    }
    return [
      { title: 'Meu Portal', icon: LayoutDashboard, path: '/' },
      { title: 'Minhas Consultas', icon: HeartPulse, path: '/history' },
    ]
  }

  const menus = getMenu()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50 px-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary w-full">
              <Activity className="h-6 w-6 text-secondary" />
              <span>KronosGest</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              {menus.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === item.path ||
                      (item.path !== '/' && location.pathname.startsWith(item.path))
                    }
                    className="hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {role === 'clinic' && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium">
                  <HeartPulse className="h-4 w-4 text-secondary" />
                  Clínica Saúde & Vida
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?seed=${role}`}
                        alt="@user"
                      />
                      <AvatarFallback>KG</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Usuário {role}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {role}@kronosgest.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
