import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Printer, FileDown, Sparkles, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { gerarSugestaoPrescricao } from '@/services/ai-functions'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

interface Step6PrescriptionProps {
  patientId?: string
  anamneseId?: string
  examesIds?: string[]
}

export default function Step6Prescription({
  patientId,
  anamneseId,
  examesIds = [],
}: Step6PrescriptionProps) {
  const [prescriptionText, setPrescriptionText] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activePatientId, setActivePatientId] = useState<string | undefined>(patientId)
  const [localExamesIds, setLocalExamesIds] = useState<string[]>(examesIds || [])
  const { toast } = useToast()

  useEffect(() => {
    setActivePatientId(patientId)

    if (patientId && (!examesIds || examesIds.length === 0)) {
      supabase
        .from('exames')
        .select('id')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setLocalExamesIds(data.map((e) => e.id))
          }
        })
    } else if (examesIds && examesIds.length > 0) {
      setLocalExamesIds(examesIds)
    }
  }, [patientId, examesIds])

  const handleGenerateSuggestion = async () => {
    if (!activePatientId) {
      toast({ title: 'Aviso', description: 'Nenhum paciente selecionado.', variant: 'destructive' })
      return
    }

    setIsLoadingAi(true)
    try {
      const { data, error } = await gerarSugestaoPrescricao(
        activePatientId,
        anamneseId,
        localExamesIds,
      )

      if (error) {
        toast({ title: 'Erro ao gerar sugestão', description: error, variant: 'destructive' })
      } else if (data?.sugestao) {
        setAiSuggestion(data.sugestao)
        toast({
          title: 'Sugestão gerada',
          description: 'A IA analisou os dados clínicos com sucesso.',
        })
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoadingAi(false)
    }
  }

  const handleSave = async () => {
    if (!activePatientId) {
      toast({ title: 'Aviso', description: 'Nenhum paciente selecionado.', variant: 'destructive' })
      return
    }
    if (!prescriptionText.trim()) {
      toast({ title: 'Aviso', description: 'O receituário está vazio.', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.from('prescricoes').insert({
        patient_id: activePatientId,
        anamnese_id: anamneseId || null,
        exames_ids: localExamesIds.length > 0 ? localExamesIds : null,
        conteudo_json: { prescricao: prescriptionText },
      })

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Prescrição salva no histórico do paciente.' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Prescrição</h2>
          <p className="text-muted-foreground">Fórmulas e recomendações ao paciente.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleGenerateSuggestion} disabled={isLoadingAi}>
            {isLoadingAi ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            )}
            Gerar Sugestão IA
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="secondary">
            <FileDown className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-secondary/50 bg-secondary/5 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-secondary-foreground font-bold">
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" /> Sugestão da IA (GPT-4o)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiSuggestion ? (
              <div className="space-y-4">
                <div className="text-xs whitespace-pre-wrap max-h-[400px] overflow-y-auto p-3 bg-background rounded-md border text-muted-foreground">
                  {aiSuggestion}
                </div>
                <Button
                  size="sm"
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() =>
                    setPrescriptionText((prev) =>
                      prev ? prev + '\n\n' + aiSuggestion : aiSuggestion,
                    )
                  }
                >
                  Copiar para Receituário
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic p-4 text-center border rounded border-dashed">
                Nenhuma sugestão gerada. Clique em "Gerar Sugestão IA" para analisar o histórico,
                exames e anamnese do paciente usando as diretrizes da SBPC/ML e SPC.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Receituário Principal (100% Editável)</label>
            <Textarea
              className="min-h-[450px] font-mono p-4 text-sm"
              placeholder="Descreva aqui os compostos, dosagens, frequência e anotações... Você pode usar a sugestão da IA ao lado como base."
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
