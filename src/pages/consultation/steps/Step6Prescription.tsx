import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Printer, FileDown, Sparkles, Save, Loader2, Pill, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { gerarSugestaoPrescricao } from '@/services/ai-functions'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

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
  const { user } = useAuth()
  const { toast } = useToast()

  const [prescriptionText, setPrescriptionText] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [activePatientId, setActivePatientId] = useState<string | undefined>(patientId)
  const [localExamesIds, setLocalExamesIds] = useState<string[]>(examesIds || [])

  const [protocols, setProtocols] = useState<any[]>([])
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('')

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
          if (data && data.length > 0) setLocalExamesIds(data.map((e) => e.id))
        })
    } else if (examesIds && examesIds.length > 0) {
      setLocalExamesIds(examesIds)
    }

    // Load available protocols for injection
    if (user?.id) {
      supabase
        .from('protocolos')
        .select('id, nome, tipo, suplementos')
        .or(`user_id.eq.${user.id},is_padrao.eq.true`)
        .then(({ data }) => {
          if (data) setProtocols(data)
        })
    }
  }, [patientId, examesIds, user?.id])

  const handleGenerateSuggestion = async () => {
    if (!activePatientId)
      return toast({
        title: 'Aviso',
        description: 'Nenhum paciente selecionado.',
        variant: 'destructive',
      })

    setIsLoadingAi(true)
    try {
      const { data, error } = await gerarSugestaoPrescricao(
        activePatientId,
        anamneseId,
        localExamesIds,
      )
      if (error) throw new Error(error)
      if (data?.sugestao) {
        setAiSuggestion(data.sugestao)
        toast({
          title: 'Sugestão gerada',
          description: 'A IA analisou os dados e protocolos disponíveis.',
        })
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoadingAi(false)
    }
  }

  const injectProtocol = async () => {
    if (!selectedProtocolId) return
    const proto = protocols.find((p) => p.id === selectedProtocolId)
    if (!proto) return

    const newText = prescriptionText
      ? `${prescriptionText}\n\n=== Protocolo: ${proto.nome} ===\n${proto.suplementos}`
      : `=== Protocolo: ${proto.nome} ===\n${proto.suplementos}`

    setPrescriptionText(newText)
    toast({ title: 'Protocolo Injetado', description: `${proto.nome} adicionado à prescrição.` })
    setSelectedProtocolId('')

    // Silently increment usage count
    supabase
      .from('protocolos')
      .select('vezes_prescrito')
      .eq('id', proto.id)
      .single()
      .then(({ data }) => {
        if (data)
          supabase
            .from('protocolos')
            .update({ vezes_prescrito: (data.vezes_prescrito || 0) + 1 })
            .eq('id', proto.id)
            .then()
      })
  }

  const handlePrint = () => {
    if (!prescriptionText.trim())
      return toast({
        title: 'Aviso',
        description: 'O receituário está vazio.',
        variant: 'destructive',
      })
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receituário Médico</title><style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #1E3A8A; }
            .content { white-space: pre-wrap; font-size: 14px; }
            .footer { margin-top: 50px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666; }
            .signature { margin-top: 80px; text-align: center; }
            .signature-line { width: 300px; border-bottom: 1px solid #333; margin: 0 auto 10px auto; }
          </style></head>
          <body>
            <div class="header"><h1>Receituário</h1><p>Data: ${new Date().toLocaleDateString('pt-BR')}</p></div>
            <div class="content">${prescriptionText}</div>
            <div class="signature"><div class="signature-line"></div><p>Assinatura do Profissional</p></div>
            <div class="footer">Uso pessoal e intransferível.</div>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleSave = async () => {
    if (!activePatientId || !prescriptionText.trim())
      return toast({ title: 'Aviso', description: 'Dados incompletos.', variant: 'destructive' })
    setIsSaving(true)
    try {
      const { error } = await supabase.from('prescricoes').insert({
        patient_id: activePatientId,
        anamnese_id: anamneseId || null,
        exames_ids: localExamesIds.length > 0 ? localExamesIds : null,
        conteudo_json: { prescricao: prescriptionText },
      })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Prescrição salva no histórico.' })
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
          <h2 className="text-2xl font-semibold text-primary">Prescrição & Protocolos</h2>
          <p className="text-muted-foreground">
            Gere fórmulas baseadas nos exames ou injete protocolos da biblioteca.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleGenerateSuggestion} disabled={isLoadingAi}>
            {isLoadingAi ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            )}
            Sugerir via IA
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
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
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" /> Inteligência Clínica
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
                  className="w-full"
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
                Clique em "Sugerir via IA" para analisar o histórico e recomendar protocolos
                específicos.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
            <Pill className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <Select value={selectedProtocolId} onValueChange={setSelectedProtocolId}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Vincular protocolo rápido à prescrição..." />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} {p.tipo ? `(${p.tipo})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={injectProtocol} disabled={!selectedProtocolId} variant="secondary">
              <Plus className="w-4 h-4 mr-2" /> Injetar
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Receituário Final (100% Editável)</label>
            <Textarea
              className="min-h-[400px] font-mono p-4 text-sm"
              placeholder="Descreva aqui os compostos, ou injete protocolos da biblioteca..."
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
