import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import AdminLogin from '@/pages/login/AdminLogin'
import ClinicaLogin from '@/pages/login/ClinicaLogin'
import ProfissionalLogin from '@/pages/login/ProfissionalLogin'
import ConsultationWizard from '@/pages/consultation/ConsultationWizard'
import PremiumConsultationWizard from '@/pages/consultation/PremiumConsultationWizard'
import CRM from '@/pages/crm/CRM'
import ConfiguracaoIA from '@/pages/crm/ConfiguracaoIA'
import Financial from '@/pages/financial/Financial'
import PatientsList from '@/pages/patients/PatientsList'
import PrescriptionsList from '@/pages/prescriptions/PrescriptionsList'
import Protocols from '@/pages/protocols/Protocols'
import AnamneseTemplates from '@/pages/settings/AnamneseTemplates'
import PatientMedicalRecord from '@/pages/patients/PatientMedicalRecord'
import Settings from '@/pages/settings/Settings'
import PatientExams from '@/pages/patient/PatientExams'
import PatientPrescriptions from '@/pages/patient/PatientPrescriptions'
import PatientSessions from '@/pages/patient/PatientSessions'
import PatientHistory from '@/pages/patient/PatientHistory'
import SessionsList from '@/pages/sessions/SessionsList'
import BiochemicalExams from '@/pages/exams/BiochemicalExams'
import BiophysicalExams from '@/pages/exams/BiophysicalExams'
import NotFound from '@/pages/NotFound'
import FeaturePlaceholder from '@/pages/shared/FeaturePlaceholder'
import PatientLogin from '@/pages/patient/PatientLogin'
import PatientDashboard from '@/pages/patient/PatientDashboard'
import PatientDocuments from '@/pages/patient/PatientDocuments'
import UpgradePage from '@/pages/upgrade/UpgradePage'
import ManageFreeAccess from '@/pages/admin/ManageFreeAccess'
import AdminDashboardSaaS from '@/pages/admin/AdminDashboardSaaS'
import Subscribers from '@/pages/admin/Subscribers'
import Billing from '@/pages/admin/Billing'
import Credits from '@/pages/admin/Credits'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/clinica" element={<ClinicaLogin />} />
          <Route path="/login/profissional" element={<ProfissionalLogin />} />
          <Route path="/login/paciente" element={<PatientLogin />} />
          <Route path="/patient-login" element={<Navigate to="/login/paciente" replace />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/consultation" element={<ConsultationWizard />} />
            <Route path="/premium-consultation" element={<PremiumConsultationWizard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/crm/configuracao-ia" element={<ConfiguracaoIA />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/:patientId/medical-record" element={<PatientMedicalRecord />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/anamnesis-templates" element={<AnamneseTemplates />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            <Route path="/admin/manage-free-access" element={<ManageFreeAccess />} />
            <Route path="/admin/dashboard" element={<AdminDashboardSaaS />} />
            <Route path="/admin/subscribers" element={<Subscribers />} />
            <Route path="/admin/billing" element={<Billing />} />
            <Route path="/admin/credits" element={<Credits />} />

            {/* Profissional / Admin Routes */}
            <Route path="/exams/biochemical" element={<BiochemicalExams />} />
            <Route path="/exams/biophysical" element={<BiophysicalExams />} />
            <Route path="/prescriptions" element={<PrescriptionsList />} />
            <Route path="/protocols" element={<Protocols />} />
            <Route path="/sessions" element={<SessionsList />} />
            <Route path="/reports" element={<FeaturePlaceholder title="Relatórios" />} />

            {/* Patient Routes */}
            <Route path="/patient/exams" element={<PatientExams />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/sessions" element={<PatientSessions />} />
            <Route path="/patient/history" element={<PatientHistory />} />
            <Route path="/patient/documents" element={<PatientDocuments />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
