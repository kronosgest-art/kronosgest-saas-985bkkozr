import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium text-muted-foreground">Inicializando...</p>
      </div>
    )
  }

  // Redirecionamento declarativo protege rotas filhas contra acessos não autenticados
  // Eliminando totalmente os erros de ciclo de renderização no React
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 flex-col border-r bg-card sm:flex">
        <div className="flex h-14 items-center border-b px-6">
          <span className="text-lg font-bold text-primary tracking-tight">KronosGest</span>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link to="/crm">
            <Button
              variant={location.pathname === '/crm' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Users className="mr-3 h-5 w-5" />
              Pacientes & CRM
            </Button>
          </Link>
          <Link to="/financial">
            <Button
              variant={location.pathname === '/financial' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <FileText className="mr-3 h-5 w-5" />
              Financeiro
            </Button>
          </Link>
        </nav>
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair da Conta
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6 sm:hidden">
          <span className="text-lg font-bold text-primary">KronosGest</span>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
