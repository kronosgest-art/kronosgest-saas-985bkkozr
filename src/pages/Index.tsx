import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import AdminDashboard from '@/components/dashboards/AdminDashboard'
import ClinicDashboard from '@/components/dashboards/ClinicDashboard'
import PatientDashboard from '@/components/dashboards/PatientDashboard'

export default function Index() {
  const { role } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!role) {
      navigate('/login', { replace: true })
    }
  }, [role, navigate])

  if (!role) {
    return null
  }

  if (role === 'admin') return <AdminDashboard />
  if (role === 'patient') return <PatientDashboard />
  return <ClinicDashboard />
}
