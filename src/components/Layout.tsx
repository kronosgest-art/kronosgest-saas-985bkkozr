import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Activity,
  HeartPulse,
  FileSignature,
  BookOpen,
  Calendar,
  PieChart,
  ClipboardList,
  Stethoscope,
  History,
  Filter,
  Star,
  User,
  Settings as SettingsIcon,
} from 'lucide-react'

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

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  // RBAC Logic
  const role = user?.user_metadata?.role || 'profissional'
  const isPatient = ['paciente', 'cliente', 'patient'].includes(role)

  const adminLinks = [
    { to: '/', label: 'Dashboard Principal', icon: LayoutDashboard },
    { to: '/crm', label: 'CRM & Leads', icon: Filter },
    { to: '/premium-consultation', label: 'Consulta Premium', icon: Star },
    { to: '/patients', label: 'Paciente', icon: User },
    { to: '/exams/biochemical', label: 'Exames Bioquímicos', icon: Activity },
    { to: '/exams/biophysical', label: 'Exames Biofísicos', icon: HeartPulse },
    { to: '/prescriptions', label: 'Prescrições', icon: FileSignature },
    { to: '/protocols', label: 'Protocolos', icon: BookOpen },
    { to: '/sessions', label: 'Sessões', icon: Calendar },
    { to: '/financial', label: 'Financeiro', icon: FileText },
    { to: '/reports', label: 'Relatórios', icon: PieChart },
    { to: '/settings', label: 'Configurações', icon: SettingsIcon },
    { to: '/settings/anamnesis-templates', label: 'Modelos de Anamnese', icon: ClipboardList },
  ]

  const patientLinks = [
    { to: '/', label: 'Minha Ficha Clínica', icon: ClipboardList },
    { to: '/patient/exams', label: 'Meus Exames', icon: Stethoscope },
    { to: '/patient/prescriptions', label: 'Minhas Prescrições', icon: FileSignature },
    { to: '/patient/sessions', label: 'Minhas Sessões Agendadas', icon: Calendar },
    { to: '/patient/history', label: 'Meu Histórico', icon: History },
  ]

  const navLinks = isPatient ? patientLinks : adminLinks

  // Simple Route Protection
  const allowedPaths = isPatient
    ? patientLinks.map((l) => l.to)
    : ['/consultation', ...adminLinks.map((l) => l.to)]

  const isAllowed = allowedPaths.some(
    (path) =>
      location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/')),
  )

  if (!isAllowed && location.pathname !== '/') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar with Blue (#1E3A8A) and Gold (#B8860B) Theme */}
      <aside className="hidden w-64 flex-col border-r border-primary/10 bg-primary sm:flex shadow-xl z-10 transition-all">
        <div className="flex h-16 items-center border-b border-primary-foreground/10 px-6">
          <span className="text-xl font-bold text-primary-foreground tracking-tight flex items-center gap-2">
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm shadow-sm">
              IMV
            </span>
            KronosGest
          </span>
        </div>
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive =
              location.pathname === link.to ||
              (location.pathname.startsWith(link.to) && link.to !== '/')
            return (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-md'
                      : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${isActive ? 'text-secondary-foreground' : 'text-primary-foreground/70'}`}
                  />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-primary-foreground/10 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-primary-foreground/80 hover:text-white hover:bg-red-500/20 transition-colors"
            onClick={() => signOut()}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair da Conta
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-muted/10">
        <header className="flex h-16 items-center gap-4 border-b bg-primary px-6 sm:hidden text-primary-foreground shadow-md">
          <span className="text-lg font-bold flex items-center gap-2">
            <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">
              IMV
            </span>
            KronosGest
          </span>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
