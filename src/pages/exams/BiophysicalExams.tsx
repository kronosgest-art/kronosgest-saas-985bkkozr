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
import { FileText, Upload, Activity, Loader2, FileSignature, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function BiophysicalExams() {
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
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
      const uploadRes = await uploadExame(selectedPatientId, 'biorressonancia', base64)
      if (uploadRes.error || !uploadRes.data?.url)
        throw new Error(uploadRes.error || 'Erro no upload')
      const exameId = uploadRes.data.exame_id
      const pdfUrl = uploadRes.data.url

      setStep('Transcrevendo documento (OCR)...')
      const transRes = await transcreverExame(pdfUrl)
      if (transRes.error || !transRes.data?.texto_extraido)
        throw new Error(transRes.error || 'Erro na transcrição')
      const textoExtraido = transRes.data.texto_extraido

      setStep('Analisando resultados...')
      const interpRes = await interpretarExame(exameId, 'biorressonancia', textoExtraido)
      if (interpRes.error || (!interpRes.data?.interpretacao_ia && !interpRes.data?.interpretacao))
        throw new Error(interpRes.error || 'Erro na interpretação')
      const interpretacao = interpRes.data.interpretacao_ia || interpRes.data.interpretacao

      setStep('Gerando sugestões de suplementação...')
      const sugRes = await gerarSugestaoPrescricao(selectedPatientId, undefined, [exameId])
      if (sugRes.error || !sugRes.data?.sugestao)
        throw new Error(sugRes.error || 'Erro ao gerar sugestão')
      const sugestao = sugRes.data.sugestao

      setResults({ texto: textoExtraido, interpretacao, sugestao })
      toast({ title: 'Sucesso', description: 'Exame processado e analisado com sucesso.' })
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setProcessing(false)
      setStep('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Exames Biofísicos</h1>
        <p className="text-muted-foreground">
          Faça o upload do laudo de biorressonância em PDF para extração e análise inteligente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Análise</CardTitle>
          <CardDescription>Selecione o paciente e o arquivo do exame (PDF)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          </div>

          <div className="space-y-2">
            <Label>Arquivo do Exame (PDF)</Label>
            <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={processing} />
          </div>

          <Button
            onClick={handleProcess}
            disabled={processing || !selectedPatientId || !file}
            className="w-full"
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
              <Activity className="h-5 w-5" /> Resultados da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="interpretacao" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="interpretacao">Interpretação Clínica</TabsTrigger>
                <TabsTrigger value="sugestao">Sugestão de Conduta</TabsTrigger>
                <TabsTrigger value="texto">Texto Extraído (OCR)</TabsTrigger>
              </TabsList>

              <TabsContent value="interpretacao">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" /> Análise de Alterações
                  </h3>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-background">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {results.interpretacao}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="sugestao">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-green-500" /> Sugestão de Suplementação
                  </h3>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-background">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {results.sugestao}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="texto">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" /> Dados Brutos Extraídos
                  </h3>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-background">
                    <div className="whitespace-pre-wrap text-xs font-mono text-muted-foreground">
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
