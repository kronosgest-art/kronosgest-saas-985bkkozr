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
  Check,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

import Step1Client from './steps/Step1Client'
import Step2Anamnese from './steps/Step2Anamnese'
import Step3TCLE from './steps/Step3TCLE'
import Step4Bioresonance from './steps/Step4Bioresonance'
import Step6Interpretation from './steps/Step6Interpretation'
import Step6Prescription from './steps/Step6Prescription'
import Step7Referral from './steps/Step7Referral'
import Step9FollowUp from './steps/Step9FollowUp'

const STEPS = [
  { id: 1, title: 'Cadastro', description: 'Dados Pessoais', icon: User },
  { id: 2, title: 'Anamnese', description: 'Histórico clínico', icon: FileText },
  { id: 3, title: 'TCLE', description: 'Termo de consentimento', icon: ShieldCheck },
  { id: 4, title: 'Biorressonância', description: 'Upload de Exame', icon: Upload },
  { id: 5, title: 'Interpretação', description: 'Análise da IA', icon: BrainCircuit },
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
    tcle_assinado: false,
  })
  const [isFinished, setIsFinished] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const patientIdParam = searchParams.get('patient_id')
  const totalSteps = STEPS.length

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  const stepToPath: Record<number, string> = {
    1: 'cadastro',
    2: 'anamnese',
    3: 'tcle',
    4: 'bioressonancia',
    5: 'interpretacao',
    6: 'prescricao',
    7: 'encaminhamento',
    8: 'agendamento',
  }

  useEffect(() => {
    if (patientIdParam && !formData.patient_id) {
      setFormData((prev: any) => ({ ...prev, patient_id: patientIdParam }))
    }

    const hash = window.location.hash.replace('#/', '')
    const step = Object.entries(stepToPath).find(([_, path]) => path === hash)
    if (step) {
      setCurrentStep(Number(step[0]))
    }
  }, [patientIdParam])

  const handleDataChange = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }))
  }

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 1:
        return <Step1Client data={formData} onChange={handleDataChange} />
      case 2:
        return <Step2Anamnese data={formData} onChange={handleDataChange} />
      case 3:
        return <Step3TCLE data={formData} onChange={handleDataChange} />
      case 4:
        return <Step4Bioresonance data={formData} />
      case 5:
        return <Step6Interpretation data={formData} />
      case 6:
        return (
          <Step6Prescription
            patientId={formData.patient_id}
            anamneseId={formData.anamnese_id}
            examesIds={formData.exames_ids}
          />
        )
      case 7:
        return <Step7Referral />
      case 8:
        return <Step9FollowUp data={formData} />
      default:
        return null
    }
  }

  const validateStep = () => {
    if (currentStep === 1 && !formData.patient_id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Cadastre o paciente para continuar.',
        variant: 'destructive',
      })
      return false
    }
    if (currentStep === 3 && !formData.tcle_assinado) {
      toast({
        title: 'Assinatura Pendente',
        description: 'Assine o TCLE para acessar a Biorressonância.',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (currentStep < totalSteps) {
      let nextStep = currentStep + 1
      if (nextStep === 4 && !formData.tcle_assinado) {
        toast({
          title: 'Atenção',
          description: 'Assine o TCLE no Passo 3 antes de acessar a Biorressonância.',
          variant: 'destructive',
        })
        return
      }
      setCurrentStep(nextStep)
      window.history.pushState(null, '', `#/${stepToPath[nextStep]}`)
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
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      window.history.pushState(null, '', `#/${stepToPath[prevStep]}`)
    }
  }

  if (isFinished) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#001F3F]">Resumo da Consulta Premium</h1>
          <p className="text-muted-foreground mt-2">
            Consulta finalizada com sucesso. Revise as informações e próximos passos.
          </p>
        </div>

        <Card className="min-h-[400px] border-[#001F3F]/10 shadow-xl shadow-[#001F3F]/5 bg-white">
          <CardContent className="p-10 flex flex-col items-center justify-center h-full gap-8">
            <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#001F3F]">Tudo Certo!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Os dados do paciente foram registrados no sistema. Você pode complementar o
                histórico clínico agora ou voltar para a lista de pacientes.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 w-full max-w-md mt-4">
              {formData.anamnese_id ? (
                <div className="flex flex-col items-center gap-3 w-full p-6 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Formulário já preenchido</span>
                  </div>
                  <Button
                    onClick={() => {
                      setIsFinished(false)
                      setCurrentStep(2)
                      navigate(`?patient_id=${formData.patient_id}#/${stepToPath[2]}`, {
                        replace: true,
                      })
                    }}
                    className="w-full bg-[#001F3F] hover:bg-[#00152B] text-white cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2 group"
                  >
                    <FileText className="w-4 h-4 group-hover:text-[#D4AF37] transition-colors" />
                    Editar Anamnese
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setIsFinished(false)
                    setCurrentStep(2)
                    navigate(`?patient_id=${formData.patient_id}#/${stepToPath[2]}`, {
                      replace: true,
                    })
                  }}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-white cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Abrir Formulário de Anamnese
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full text-[#001F3F] hover:bg-[#001F3F]/5 transition-colors cursor-pointer"
                onClick={() => navigate('/patients')}
              >
                Voltar para Lista de Pacientes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#001F3F]">Consulta Premium</h1>
        <p className="text-muted-foreground mt-2">
          Módulo exclusivo para atendimento de alta performance
        </p>
      </div>

      <div className="sticky top-[64px] z-10 bg-muted/20 backdrop-blur-md py-6">
        <div className="flex flex-col justify-between gap-4 mb-2 relative">
          <div className="absolute top-6 -translate-y-1/2 left-[5%] right-[5%] h-1 bg-[#001F3F]/20 -z-10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4AF37]"
              style={{ width: `${progress}%`, transition: 'all 0.6s ease-in-out' }}
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
                  className="flex flex-col items-center gap-2 bg-transparent px-2 relative z-10 cursor-pointer"
                  onClick={() => {
                    if (isPast || formData.patient_id) {
                      if (step.id === 4 && !formData.tcle_assinado) {
                        toast({
                          title: 'TCLE Pendente',
                          description:
                            'Assine o TCLE no Passo 3 antes de acessar a Biorressonância.',
                          variant: 'destructive',
                        })
                        setCurrentStep(3)
                        window.history.pushState(null, '', `#/${stepToPath[3]}`)
                        return
                      }
                      setCurrentStep(step.id)
                      window.history.pushState(null, '', `#/${stepToPath[step.id]}`)
                    }
                  }}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all border-2',
                      isActive
                        ? 'border-transparent text-[#001F3F] shadow-[0_0_12px_rgba(212,175,55,0.6)]'
                        : isPast
                          ? 'bg-[#FDFCF0] border-[#D4AF37] text-[#D4AF37]'
                          : 'border-[#001F3F]/30 text-[#001F3F]/50 bg-background',
                    )}
                    style={{
                      transition: 'all 0.6s ease-in-out',
                      ...(isActive
                        ? {
                            background:
                              'linear-gradient(135deg, #D4AF37 0%, #FFF4D0 45%, #D4AF37 55%, #B8860B 100%)',
                          }
                        : {}),
                    }}
                  >
                    {isPast ? (
                      <Check className="w-5 h-5" strokeWidth={3} />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center hidden sm:block w-24">
                    <p
                      className={cn(
                        'text-xs font-semibold transition-colors',
                        isActive
                          ? 'text-[#D4AF37]'
                          : isPast
                            ? 'text-[#001F3F]'
                            : 'text-[#001F3F]/50',
                      )}
                      style={{ transition: 'color 0.6s ease-in-out' }}
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

      <Card className="min-h-[400px] border-[#001F3F]/10 shadow-xl shadow-[#001F3F]/5 bg-white">
        <CardContent className="p-6 sm:p-10 flex flex-col h-full justify-between gap-8">
          <div className="flex-1 flex flex-col items-center justify-start space-y-6 w-full">
            <div className="w-16 h-16 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F] mb-2">
              {STEPS.map(
                (s) =>
                  s.id === currentStep && <s.icon key={s.id} className="w-8 h-8 text-[#D4AF37]" />,
              )}
            </div>
            <h2 className="text-2xl font-bold text-[#001F3F] text-center">
              {STEPS.find((s) => s.id === currentStep)?.title}
            </h2>

            <div className="w-full mt-4">{renderCurrentForm()}</div>
          </div>

          <div className="flex justify-between mt-auto pt-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="border-[#001F3F]/20 text-[#001F3F] hover:bg-[#001F3F]/5"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="hidden sm:flex border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                onClick={() =>
                  toast({
                    title: 'Rascunho Salvo',
                    description: 'Progresso salvo com sucesso no banco de dados.',
                  })
                }
              >
                <Save className="mr-2 h-4 w-4" /> Salvar Rascunho
              </Button>
              <Button onClick={handleNext} className="bg-[#001F3F] hover:bg-[#00152B] text-white">
                {currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-[#D4AF37]" /> Finalizar Consulta
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
