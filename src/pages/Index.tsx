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

  if (loading || !user) {
    return null
  }

  const role = user.user_metadata?.role || 'clinic'

  if (role === 'admin') return <AdminDashboard />
  if (role === 'patient') return <PatientDashboard />
  return <ClinicDashboard />
}
