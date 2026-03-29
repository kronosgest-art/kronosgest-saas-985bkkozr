import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import AdminDashboard from '@/components/dashboards/AdminDashboard'
import ClinicDashboard from '@/components/dashboards/ClinicDashboard'
import PatientDashboard from '@/components/dashboards/PatientDashboard'

export default function Index() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium text-muted-foreground">Redirecionando...</p>
      </div>
    )
  }

  const role = user.user_metadata?.role || 'clinic'

  if (role === 'admin') return <AdminDashboard />
  if (role === 'patient') return <PatientDashboard />
  return <ClinicDashboard />
}
