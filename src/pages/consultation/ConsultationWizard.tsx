import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, ChevronLeft, Save, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Step1Client from './steps/Step1Client'
import Step2Anamnesis from './steps/Step2Anamnesis'
import Step3TCLE from './steps/Step3TCLE'
import Step4Bioresonance from './steps/Step4Bioresonance'
import Step5Exams from './steps/Step5Exams'
import Step6Prescription from './steps/Step6Prescription'
import Step7Referral from './steps/Step7Referral'
import Step8Protocols from './steps/Step8Protocols'
import Step9FollowUp from './steps/Step9FollowUp'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  'Cliente',
  'Anamnese',
  'TCLE',
  'Bioressonância',
  'Exames',
  'Prescrição',
  'Encaminhamento',
  'Protocolos',
  'Acompanhamento',
]

export default function ConsultationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const totalSteps = STEPS.length
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1)
      toast({ title: 'Rascunho Salvo', description: 'Os dados da etapa foram salvos.' })
    } else {
      toast({
        title: 'Consulta Finalizada',
        description: 'Todos os dados foram registrados com sucesso.',
      })
      navigate('/')
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="sticky top-[64px] z-10 bg-background/95 backdrop-blur py-4 border-b border-border/50">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>
            Passo {currentStep} de {totalSteps}:{' '}
            <span className="text-primary">{STEPS[currentStep - 1]}</span>
          </span>
          <span>{Math.round(progress)}% Concluído</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => toast({ title: 'Salvo', description: 'Progresso salvo com sucesso.' })}
            >
              <Save className="mr-2 h-4 w-4" /> Salvar e Sair
            </Button>
            <Button onClick={handleNext}>
              {currentStep === totalSteps ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Finalizar
                </>
              ) : (
                <>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Card className="min-h-[500px] border-primary/10 shadow-md">
        <CardContent className="p-6 sm:p-10">
          {currentStep === 1 && <Step1Client />}
          {currentStep === 2 && <Step2Anamnesis />}
          {currentStep === 3 && <Step3TCLE />}
          {currentStep === 4 && <Step4Bioresonance />}
          {currentStep === 5 && <Step5Exams />}
          {currentStep === 6 && <Step6Prescription />}
          {currentStep === 7 && <Step7Referral />}
          {currentStep === 8 && <Step8Protocols />}
          {currentStep === 9 && <Step9FollowUp />}
        </CardContent>
      </Card>
    </div>
  )
}
