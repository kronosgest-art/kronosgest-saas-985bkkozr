import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import {
  uploadExame,
  transcreverExame,
  interpretarExame,
  gerarSugestaoPrescricao,
} from '@/services/ai-functions'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Upload,
  Activity,
  Loader2,
  FileSignature,
  AlertCircle,
  Printer,
  CheckCircle,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function BiochemicalExams() {
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [anamnese, setAnamnese] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState('')
  const [results, setResults] = useState<{
    texto?: string
    interpretacao?: string
    sugestao?: string
  } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPatients = async () => {
      const { data } = await supabase
        .from('pacientes')
        .select('id, nome_completo')
        .order('nome_completo')
      if (data) setPatients(data)
    }
    fetchPatients()
  }, [])

  useEffect(() => {
    const fetchAnamnese = async () => {
      if (!selectedPatientId) {
        setAnamnese(null)
        return
      }
      const { data } = await supabase
        .from('anamnese')
        .select('anamnese_id, criado_em')
        .eq('patient_id', selectedPatientId)
        .order('criado_em', { ascending: false })
        .limit(1)
        .single()

      setAnamnese(data)
    }
    fetchAnamnese()
  }, [selectedPatientId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handlePrint = (title: string, content: string) => {
    if (!content) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; color: #1E3A8A; font-size: 24px; }
              .content { white-space: pre-wrap; font-size: 14px; }
              .footer { margin-top: 50px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${title}</h1>
              <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="content">${content}</div>
            <div class="footer">
              KronosGest - Documento gerado eletronicamente.
            </div>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleProcess = async () => {
    if (!selectedPatientId || !file) {
      toast({
        title: 'Atenção',
        description: 'Selecione um paciente e um arquivo PDF.',
        variant: 'destructive',
      })
      return
    }

    setProcessing(true)
    setResults(null)
    try {
      setStep('Convertendo arquivo...')
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
      })

      setStep('Fazendo upload do exame...')
      const uploadRes = await uploadExame(selectedPatientId, 'bioquimico', base64)
      if (uploadRes.error || !uploadRes.data?.url)
        throw new Error(uploadRes.error || 'Erro no upload')
      const exameId = uploadRes.data.exame_id
      const pdfUrl = uploadRes.data.url

      setStep('Transcrevendo documento (OCR)...')
      const transRes = await transcreverExame(pdfUrl)
      if (transRes.error || !transRes.data?.texto_extraido)
        throw new Error(transRes.error || 'Erro na transcrição')
      const textoExtraido = transRes.data.texto_extraido

      setStep('Analisando resultados (Lair Ribeiro)...')
      const interpRes = await interpretarExame(exameId, 'bioquimico', textoExtraido)
      if (interpRes.error || (!interpRes.data?.interpretacao_ia && !interpRes.data?.interpretacao))
        throw new Error(interpRes.error || 'Erro na interpretação')
      const interpretacao = interpRes.data.interpretacao_ia || interpRes.data.interpretacao

      setStep('Gerando sugestões de prescrição...')
      const sugRes = await gerarSugestaoPrescricao(selectedPatientId, anamnese?.anamnese_id, [
        exameId,
      ])
      if (sugRes.error || !sugRes.data?.sugestao)
        throw new Error(sugRes.error || 'Erro ao gerar sugestão')
      const sugestao = sugRes.data.sugestao

      setResults({ texto: textoExtraido, interpretacao, sugestao })
      toast({
        title: 'Sucesso',
        description: 'Exame laboratorial processado e analisado com sucesso.',
      })
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setProcessing(false)
      setStep('')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Exames Bioquímicos</h1>
        <p className="text-muted-foreground">
          Faça o upload do exame laboratorial em PDF para análise com base em níveis ideais de saúde
          e prescrição de carências nutricionais.
        </p>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>Nova Análise Laboratorial</CardTitle>
          <CardDescription>Selecione o paciente e o arquivo do exame (PDF)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Select
              value={selectedPatientId}
              onValueChange={setSelectedPatientId}
              disabled={processing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPatientId && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {anamnese ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" /> Anamnese localizada, será
                    utilizada como contexto.
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-yellow-500" /> Nenhuma anamnese encontrada
                    para este paciente.
                  </>
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Arquivo do Exame Laboratorial (PDF)</Label>
            <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={processing} />
          </div>

          <Button
            onClick={handleProcess}
            disabled={processing || !selectedPatientId || !file}
            className="w-full bg-[#1E3A8A] hover:bg-[#152865] text-white"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {step}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Processar Exame
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary/20 shadow-md animate-fade-in">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Activity className="h-5 w-5" /> Resultados da Análise Integrativa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="interpretacao" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="interpretacao">Interpretação Clínica</TabsTrigger>
                <TabsTrigger value="sugestao">Prescrição Nutricional</TabsTrigger>
                <TabsTrigger value="texto">Texto Extraído (OCR)</TabsTrigger>
              </TabsList>

              <TabsContent value="interpretacao">
                <div className="rounded-md bg-muted p-4 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2 text-blue-700">
                      <AlertCircle className="h-4 w-4" /> Análise de Alterações (Níveis Ideais)
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePrint(
                          'Interpretação Clínica do Exame Laboratorial',
                          results.interpretacao || '',
                        )
                      }
                    >
                      <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </Button>
                  </div>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-white">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                      {results.interpretacao}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="sugestao">
                <div className="rounded-md bg-muted p-4 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2 text-green-700">
                      <FileSignature className="h-4 w-4" /> Sugestão de Suplementação
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePrint(
                          'Prescrição de Suplementação Nutricional',
                          results.sugestao || '',
                        )
                      }
                    >
                      <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </Button>
                  </div>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-white">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                      {results.sugestao}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="texto">
                <div className="rounded-md bg-muted p-4 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2 text-orange-700">
                      <FileText className="h-4 w-4" /> Dados Brutos Extraídos
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePrint('Dados Brutos Extraídos do Exame', results.texto || '')
                      }
                    >
                      <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </Button>
                  </div>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-white">
                    <div className="whitespace-pre-wrap text-xs font-mono text-slate-600">
                      {results.texto}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
