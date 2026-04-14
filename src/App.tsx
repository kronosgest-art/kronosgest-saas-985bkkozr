import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import ConsultationWizard from '@/pages/consultation/ConsultationWizard'
import PremiumConsultationWizard from '@/pages/consultation/PremiumConsultationWizard'
import CRM from '@/pages/crm/CRM'
import Financial from '@/pages/financial/Financial'
import PatientsList from '@/pages/patients/PatientsList'
import PrescriptionsList from '@/pages/prescriptions/PrescriptionsList'
import Protocols from '@/pages/protocols/Protocols'
import AnamneseTemplates from '@/pages/settings/AnamneseTemplates'
import PatientMedicalRecord from '@/pages/patients/PatientMedicalRecord'
import Settings from '@/pages/settings/Settings'
import SessionsList from '@/pages/sessions/SessionsList'
import BiochemicalExams from '@/pages/exams/BiochemicalExams'
import BiophysicalExams from '@/pages/exams/BiophysicalExams'
import NotFound from '@/pages/NotFound'
import FeaturePlaceholder from '@/pages/shared/FeaturePlaceholder'
import UpgradePage from '@/pages/upgrade/UpgradePage'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/consultation" element={<ConsultationWizard />} />
            <Route path="/premium-consultation" element={<PremiumConsultationWizard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/:patientId/medical-record" element={<PatientMedicalRecord />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/anamnesis-templates" element={<AnamneseTemplates />} />
            <Route path="/upgrade" element={<UpgradePage />} />

            {/* Profissional / Admin Routes */}
            <Route path="/exams/biochemical" element={<BiochemicalExams />} />
            <Route path="/exams/biophysical" element={<BiophysicalExams />} />
            <Route path="/prescriptions" element={<PrescriptionsList />} />
            <Route path="/protocols" element={<Protocols />} />
            <Route path="/sessions" element={<SessionsList />} />
            <Route path="/reports" element={<FeaturePlaceholder title="Relatórios" />} />

            {/* Patient Routes */}
            <Route path="/patient/exams" element={<FeaturePlaceholder title="Meus Exames" />} />
            <Route
              path="/patient/prescriptions"
              element={<FeaturePlaceholder title="Minhas Prescrições" />}
            />
            <Route
              path="/patient/sessions"
              element={<FeaturePlaceholder title="Minhas Sessões Agendadas" />}
            />
            <Route path="/patient/history" element={<FeaturePlaceholder title="Meu Histórico" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
