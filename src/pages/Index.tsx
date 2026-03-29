import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import AdminDashboard from '@/components/dashboards/AdminDashboard'
import ClinicDashboard from '@/components/dashboards/ClinicDashboard'
import PatientDashboard from '@/components/dashboards/PatientDashboard'

export default function Index() {
  const { role } = useAuthStore()

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (role === 'admin') return <AdminDashboard />
  if (role === 'patient') return <PatientDashboard />
  return <ClinicDashboard />
}
