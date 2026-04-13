import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
import logoImg from '@/assets/photo-2026-04-13-12-26-51-1908e.jpg'

export default function Layout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium text-muted-foreground font-sans">Inicializando...</p>
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
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/crm', label: 'CRM & Leads', icon: Filter },
    { to: '/premium-consultation', label: 'Consulta Premium', icon: Star, isPremium: true },
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
    <div className="flex min-h-screen bg-[#FDFCF0] text-[#333333] font-sans">
      <aside className="hidden w-72 flex-col border-r border-[#333333]/10 bg-[#001F3F] sm:flex shadow-2xl z-10 transition-all">
        <div className="flex flex-col items-center justify-center border-b border-[#FDFCF0]/10 px-4 py-8">
          <div className="flex flex-col items-center justify-center text-center w-full">
            <img
              src={logoImg}
              alt="Kronos Gest"
              className="w-full max-w-[220px] object-contain mix-blend-lighten"
            />
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive =
              location.pathname === link.to ||
              (location.pathname.startsWith(link.to) && link.to !== '/')
            const isPremium = (link as any).isPremium

            return (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start transition-all duration-300 font-sans tracking-wide text-sm h-11',
                    isActive
                      ? 'bg-[#C5A059]/15 text-[#C5A059] font-semibold border-l-[3px] border-[#C5A059] rounded-l-none rounded-r-md shadow-sm'
                      : 'text-[#FDFCF0]/70 hover:bg-[#FDFCF0]/10 hover:text-[#FDFCF0]',
                    isPremium && !isActive && 'text-[#C5A059]/80 hover:text-[#C5A059]',
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-[18px] w-[18px]',
                      isActive
                        ? 'text-[#C5A059]'
                        : isPremium
                          ? 'text-[#C5A059]/80'
                          : 'text-[#FDFCF0]/50',
                    )}
                  />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-[#FDFCF0]/10 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-[#FDFCF0]/70 hover:text-white hover:bg-red-500/20 transition-colors font-sans"
            onClick={() => signOut()}
          >
            <LogOut className="mr-3 h-[18px] w-[18px]" />
            Sair da Conta
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#FDFCF0]">
        <header className="flex h-16 items-center gap-4 border-b border-[#333333]/10 bg-[#001F3F] px-6 sm:hidden text-[#C5A059] shadow-md">
          <img
            src={logoImg}
            alt="Kronos Gest"
            className="h-10 w-auto object-contain object-left mix-blend-lighten"
          />
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-[#FDFCF0]/80 hover:bg-[#FDFCF0]/20 hover:text-[#FDFCF0]"
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
