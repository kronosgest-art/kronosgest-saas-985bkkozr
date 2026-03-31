import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function Step3TCLE() {
  const [agreed, setAgreed] = useState(false)
  const defaultText = `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)

Eu, abaixo assinado, declaro ter sido informado(a) de forma clara e objetiva sobre a natureza dos procedimentos, exames e terapias propostos na KronosGest. 
Compreendo que a terapia ortomolecular e a bioressonância são práticas complementares e não substituem o tratamento médico convencional.

Autorizo o profissional responsável a realizar as práticas recomendadas e concordo com os termos descritos.`

  const [text, setText] = useState(defaultText)

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Termo de Consentimento</h2>
        <p className="text-muted-foreground">Obrigatório para prosseguir com o tratamento.</p>
      </div>

      <div className="space-y-4">
        <Label>Texto do Documento (Editável)</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[250px] font-mono text-sm"
        />
      </div>

      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg border border-primary/20">
        <Checkbox id="terms" checked={agreed} onCheckedChange={(c) => setAgreed(c as boolean)} />
        <Label htmlFor="terms" className="text-base font-medium cursor-pointer">
          O paciente leu e concorda com os termos acima.
        </Label>
      </div>
    </div>
  )
}
