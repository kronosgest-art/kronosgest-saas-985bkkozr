import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle,
  User,
  FileText,
  ShieldCheck,
  Upload,
  BrainCircuit,
  FileSignature,
  Share2,
  CalendarDays,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  StepCadastro,
  StepTCLE,
  StepBiorressonancia,
  StepLaboratorial,
  StepPrescricao,
} from './WizardForms'
import Step2Anamnese from './steps/Step2Anamnese'
import StepUploadExame from './steps/StepUploadExame'

const STEPS = [
  { id: 1, title: 'Cadastro', description: 'Selecionar Paciente', icon: User },
  { id: 2, title: 'Anamnese', description: 'Histórico clínico', icon: FileText },
  { id: 3, title: 'Biorressonância', description: 'Upload de Exame', icon: Upload },
  { id: 4, title: 'Laboratorial', description: 'Upload de Exame', icon: Upload },
  { id: 5, title: 'TCLE', description: 'Termo de consentimento', icon: ShieldCheck },
  { id: 6, title: 'Prescrição', description: 'Receituário final', icon: FileSignature },
  { id: 7, title: 'Encaminhamento', description: 'Direcionamento', icon: Share2 },
  { id: 8, title: 'Agendamento', description: 'Próxima consulta', icon: CalendarDays },
]

export default function PremiumConsultationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>({
    id: null,
    patient_id: null,
    name: '',
    cpf: '',
    email: '',
    phone: '',
    queixa: '',
    historico: '',
    aceite: false,
    biorressonancia: '',
    laboratorial: '',
    prescricao: '',
    orientacoes: '',
  })
  const [isFinished, setIsFinished] = useState(false)
  const navigate = useNavigate()
  const totalSteps = STEPS.length

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  useEffect(() => {
    if (isFinished) {
      navigate('/patients')
    }
  }, [isFinished, navigate])

  const handleDataChange = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }))
  }

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 1:
        return <StepCadastro data={formData} onChange={handleDataChange} />
      case 2:
        return <Step2Anamnese data={formData} onChange={handleDataChange} />
      case 3:
        return (
          <StepUploadExame
            tipoExame="biorressonancia"
            patientId={formData.patient_id}
            onNext={handleNext}
          />
        )
      case 4:
        return (
          <StepUploadExame
            tipoExame="laboratorial"
            patientId={formData.patient_id}
            onNext={handleNext}
          />
        )
      case 5:
        return <StepTCLE data={formData} onChange={handleDataChange} />
      case 6:
        return <StepPrescricao data={formData} onChange={handleDataChange} />
      case 7:
        return (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Módulo de Encaminhamento em desenvolvimento...
          </div>
        )
      case 8:
        return (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Módulo de Agendamento em desenvolvimento...
          </div>
        )
      default:
        return null
    }
  }

  const validateStep = () => {
    if (currentStep === 1 && (!formData.name || !formData.cpf)) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e CPF do paciente.',
        variant: 'destructive',
      })
      return false
    }
    if (currentStep === 5 && !formData.aceite) {
      toast({
        title: 'Termo Obrigatório',
        description: 'É necessário aceitar o termo de consentimento.',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast({ title: 'Etapa concluída', description: 'Os dados foram salvos temporariamente.' })
    } else {
      toast({
        title: 'Consulta Premium Finalizada',
        description: 'Todos os dados foram registrados no sistema com sucesso.',
      })
      setIsFinished(true)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A8A]">Consulta Premium</h1>
        <p className="text-muted-foreground mt-2">
          Módulo exclusivo para atendimento de alta performance
        </p>
      </div>

      <div className="sticky top-[64px] z-10 bg-muted/20 backdrop-blur-md py-6">
        <div className="flex flex-col justify-between gap-4 mb-2 relative">
          <div className="absolute top-6 left-[5%] right-[5%] h-1 bg-border -z-10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1E3A8A] transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between w-full">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep
              const isPast = step.id < currentStep
              const StepIcon = step.icon

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2 bg-transparent px-2 relative z-10"
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300',
                      isActive
                        ? 'border-[#B8860B] bg-[#1E3A8A] text-white shadow-lg shadow-[#1E3A8A]/30'
                        : isPast
                          ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                          : 'border-muted-foreground/30 bg-background text-muted-foreground',
                    )}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="text-center hidden sm:block w-24">
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        isActive ? 'text-[#1E3A8A]' : 'text-muted-foreground',
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Card className="min-h-[400px] border-[#1E3A8A]/10 shadow-xl shadow-[#1E3A8A]/5 bg-white">
        <CardContent className="p-6 sm:p-10 flex flex-col h-full justify-between gap-8">
          <div className="flex-1 flex flex-col items-center justify-start space-y-6 w-full">
            <div className="w-16 h-16 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center text-[#1E3A8A] mb-2">
              {STEPS.map(
                (s) =>
                  s.id === currentStep && <s.icon key={s.id} className="w-8 h-8 text-[#B8860B]" />,
              )}
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A8A] text-center">
              {STEPS.find((s) => s.id === currentStep)?.title}
            </h2>

            <div className="w-full mt-4">{renderCurrentForm()}</div>
          </div>

          <div className="flex justify-between mt-auto pt-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="border-[#1E3A8A]/20 text-[#1E3A8A] hover:bg-[#1E3A8A]/5"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="hidden sm:flex border-[#B8860B]/50 text-[#B8860B] hover:bg-[#B8860B]/10 hover:text-[#B8860B]"
                onClick={() =>
                  toast({
                    title: 'Rascunho Salvo',
                    description: 'Progresso salvo com sucesso no banco de dados.',
                  })
                }
              >
                <Save className="mr-2 h-4 w-4" /> Salvar Rascunho
              </Button>
              <Button onClick={handleNext} className="bg-[#1E3A8A] hover:bg-[#152865] text-white">
                {currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-[#B8860B]" /> Finalizar Consulta
                  </>
                ) : (
                  <>
                    Próxima <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
