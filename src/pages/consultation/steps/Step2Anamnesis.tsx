import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2 } from 'lucide-react'

export default function Step2Anamnesis() {
  const [questions, setQuestions] = useState([
    { id: 1, type: 'text', q: 'Qual a queixa principal?' },
    { id: 2, type: 'scale', q: 'Nível de dor (1 a 10)?', value: [5] },
    { id: 3, type: 'radio', q: 'Faz uso de medicação contínua?' },
  ])

  const [answers, setAnswers] = useState<Record<number, any>>({})

  const handleAnswerChange = (id: number, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="space-y-8 animate-slide-in-right">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Anamnese Editável</h2>
          <p className="text-muted-foreground">Avaliação clínica detalhada do paciente.</p>
        </div>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pergunta
        </Button>
      </div>

      <div className="space-y-6">
        {questions.map((item, index) => (
          <div key={item.id} className="p-4 border rounded-lg bg-card relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Label className="text-base font-medium mb-3 block">
              {index + 1}. {item.q}
            </Label>

            {item.type === 'text' && (
              <Textarea
                placeholder="Resposta do paciente..."
                value={answers[item.id] || ''}
                onChange={(e) => handleAnswerChange(item.id, e.target.value)}
              />
            )}

            {item.type === 'scale' && (
              <div className="pt-4 px-2">
                <Slider
                  value={answers[item.id] || item.value}
                  onValueChange={(val) => handleAnswerChange(item.id, val)}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0 (Sem dor)</span>
                  <span>10 (Máxima)</span>
                </div>
              </div>
            )}

            {item.type === 'radio' && (
              <RadioGroup
                value={answers[item.id] || 'nao'}
                onValueChange={(val) => handleAnswerChange(item.id, val)}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id={`sim-${item.id}`} />
                  <Label htmlFor={`sim-${item.id}`}>Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id={`nao-${item.id}`} />
                  <Label htmlFor={`nao-${item.id}`}>Não</Label>
                </div>
              </RadioGroup>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
