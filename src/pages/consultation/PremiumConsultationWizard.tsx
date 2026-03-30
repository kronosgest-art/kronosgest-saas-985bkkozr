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
  Activity,
  TestTube,
  FileSignature,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, title: 'Cadastro', description: 'Dados do paciente', icon: User },
  { id: 2, title: 'Anamnese', description: 'Histórico clínico', icon: FileText },
  { id: 3, title: 'TCLE', description: 'Termo de consentimento', icon: ShieldCheck },
  { id: 4, title: 'Biorressonância', description: 'Análise quântica', icon: Activity },
  { id: 5, title: 'Laboratorial', description: 'Exames e laudos', icon: TestTube },
  { id: 6, title: 'Prescrição', description: 'Receituário final', icon: FileSignature },
]

export default function PremiumConsultationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const [isFinished, setIsFinished] = useState(false)
  const totalSteps = STEPS.length

  // Calcula o progresso visual com base no índice ativo
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  useEffect(() => {
    if (isFinished) {
      navigate('/')
    }
  }, [isFinished, navigate])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1)
      toast({ title: 'Etapa concluída', description: 'Os dados foram salvos com sucesso.' })
    } else {
      toast({
        title: 'Consulta Premium Finalizada',
        description: 'Todos os dados foram registrados no sistema de forma segura.',
      })
      setIsFinished(true)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A8A]">Consulta Premium</h1>
        <p className="text-muted-foreground mt-2">
          Módulo exclusivo para atendimento de alta performance
        </p>
      </div>

      <div className="sticky top-[64px] z-10 bg-background/95 backdrop-blur-md py-6 border-b border-border/50">
        <div className="flex flex-col justify-between gap-4 mb-2 relative">
          <div className="absolute top-6 left-[5%] right-[5%] h-1 bg-muted -z-10 rounded-full overflow-hidden">
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
                  className="flex flex-col items-center gap-2 bg-background px-2 relative z-10"
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300',
                      isActive
                        ? 'border-[#B8860B] bg-[#1E3A8A] text-white shadow-lg shadow-[#1E3A8A]/30'
                        : isPast
                          ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                          : 'border-muted bg-background text-muted-foreground',
                    )}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="text-center hidden md:block w-24">
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        isActive ? 'text-[#1E3A8A]' : 'text-muted-foreground',
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Card className="min-h-[400px] border-[#1E3A8A]/10 shadow-xl shadow-[#1E3A8A]/5">
        <CardContent className="p-6 sm:p-10 flex flex-col h-full justify-between gap-8">
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-10">
            <div className="w-24 h-24 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center text-[#1E3A8A]">
              {STEPS.map(
                (s) =>
                  s.id === currentStep && (
                    <s.icon key={s.id} className="w-12 h-12 text-[#B8860B]" />
                  ),
              )}
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A8A]">
              {STEPS.find((s) => s.id === currentStep)?.title}
            </h2>
            <p className="text-muted-foreground max-w-md">
              Área de preenchimento de dados referentes à etapa de{' '}
              {STEPS.find((s) => s.id === currentStep)?.title.toLowerCase()}. Preencha os
              formulários e salve para prosseguir com a consulta premium.
            </p>
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
                  toast({ title: 'Rascunho Salvo', description: 'Progresso salvo com sucesso.' })
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
