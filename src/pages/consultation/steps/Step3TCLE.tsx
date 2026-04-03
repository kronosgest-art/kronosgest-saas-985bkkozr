import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SignaturePad } from '@/components/SignaturePad'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface Step3TCLEProps {
  data?: any
  onChange?: (data: any) => void
}

export default function Step3TCLE({ data, onChange }: Step3TCLEProps) {
  const [agreed, setAgreed] = useState(data?.tcle_assinado || false)
  const [isSaving, setIsSaving] = useState(false)
  const defaultText = `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)

Eu, abaixo assinado, declaro ter sido informado(a) de forma clara e objetiva sobre a natureza dos procedimentos, exames e terapias propostos. 
Compreendo que a terapia ortomolecular e a bioressonância são práticas complementares e não substituem o tratamento médico convencional.

Autorizo o profissional responsável a realizar as práticas recomendadas e concordo com os termos descritos.`

  const [text, setText] = useState(defaultText)

  const handleSign = async (signatureData: { type: 'click' | 'draw'; data: string }) => {
    if (!data?.patient_id) {
      toast({ title: 'Erro', description: 'Paciente não identificado.', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.from('tcle_assinado').insert({
        patient_id: data.patient_id,
        assinatura: signatureData.data,
        tipo_assinatura: signatureData.type,
      })

      if (error) throw error

      setAgreed(true)
      onChange?.({ tcle_assinado: true })
      toast({ title: '✓ TCLE assinado com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
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

      {!agreed ? (
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-primary">Assinatura do Paciente</Label>
          {isSaving ? (
            <div className="flex items-center justify-center p-8 border rounded-xl bg-muted/30">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <SignaturePad onSign={handleSign} patientName={data?.name || 'Paciente'} />
          )}
        </div>
      ) : (
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4 text-green-800">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-lg">Documento Assinado</h3>
            <p className="text-sm opacity-90">O TCLE foi assinado e registrado com sucesso.</p>
          </div>
        </div>
      )}
    </div>
  )
}
