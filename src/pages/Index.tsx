import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import AdminDashboard from '@/components/dashboards/AdminDashboard'
import ClinicDashboard from '@/components/dashboards/ClinicDashboard'
import PatientDashboard from '@/components/dashboards/PatientDashboard'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium text-muted-foreground">Verificando sessão...</p>
      </div>
    )
  }

  // Redirecionamento declarativo garante que o erro "navigate() during render" nunca ocorra
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const role = user.user_metadata?.role || 'profissional'

  if (role === 'admin') return <AdminDashboard />
  if (role === 'paciente' || role === 'cliente' || role === 'patient') return <PatientDashboard />
  return <ClinicDashboard />
}
