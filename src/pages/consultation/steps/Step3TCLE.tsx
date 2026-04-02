import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Step3TCLEProps {
  data?: any
  onChange?: (data: any) => void
}

export default function Step3TCLE({ data, onChange }: Step3TCLEProps) {
  const [agreed, setAgreed] = useState(data?.tcle_assinado || false)
  const defaultText = `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)

Eu, abaixo assinado, declaro ter sido informado(a) de forma clara e objetiva sobre a natureza dos procedimentos, exames e terapias propostos. 
Compreendo que a terapia ortomolecular e a bioressonância são práticas complementares e não substituem o tratamento médico convencional.

Autorizo o profissional responsável a realizar as práticas recomendadas e concordo com os termos descritos.`

  const [text, setText] = useState(defaultText)

  const handleCheck = (c: boolean) => {
    setAgreed(c)
    onChange?.({ tcle_assinado: c })
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Termo de Consentimento</h2>
        <p className="text-muted-foreground">
          Obrigatório para o upload e análise de exames de Biorressonância.
        </p>
      </div>

      <div className="space-y-4">
        <Label>Texto do Documento (Editável)</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[250px] font-mono text-sm"
        />
      </div>

      <div className="flex items-center space-x-3 p-6 bg-muted/50 rounded-xl border border-primary/20 hover:bg-muted/80 transition-colors">
        <Checkbox id="terms" checked={agreed} onCheckedChange={handleCheck} className="w-6 h-6" />
        <Label htmlFor="terms" className="text-base font-medium cursor-pointer flex-1">
          O paciente leu e concorda integralmente com os termos acima.
        </Label>
      </div>
    </div>
  )
}
