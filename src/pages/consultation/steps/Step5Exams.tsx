import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UploadCloud, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { uploadExame, interpretarExame } from '@/services/ai-functions'

export default function Step5Exams({ data }: { data?: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!data?.patient_id) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>Cadastre o paciente no Passo 1 primeiro.</AlertDescription>
      </Alert>
    )
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') return setError('Apenas arquivos PDF são aceitos.')
    if (file.size > 10 * 1024 * 1024) return setError('Arquivo excede o limite de 10MB.')

    setError(null)
    setIsUploading(true)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64 = reader.result as string
      try {
        const { data: uploadData, error: uploadError } = await uploadExame(
          data.patient_id,
          'laboratorial',
          base64,
          data.organization_id,
        )
        if (uploadError || !uploadData)
          throw new Error(uploadError || 'Erro ao fazer upload. Tente novamente.')

        setIsUploading(false)
        setIsAnalyzing(true)

        const { data: analyzeData, error: analyzeError } = await interpretarExame(
          uploadData.exame_id,
          'laboratorial',
          uploadData.url,
        )
        if (analyzeError || !analyzeData)
          throw new Error(analyzeError || 'Erro ao interpretar exame. Tente novamente.')

        setInterpretation(analyzeData.interpretacao_ia)
        toast({ title: 'Sucesso', description: 'Exame analisado com sucesso!' })
      } catch (err: any) {
        setError(err.message || 'Erro inesperado')
      } finally {
        setIsUploading(false)
        setIsAnalyzing(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  const formatInterpretation = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.includes('ENCAMINHAR AO MÉDICO')) {
        return (
          <span
            key={i}
            className="bg-yellow-200 text-yellow-900 font-semibold px-2 py-1 rounded block my-2"
          >
            {line}
          </span>
        )
      }
      if (line.toLowerCase().includes('acompanhamento')) {
        return (
          <span
            key={i}
            className="bg-green-200 text-green-900 font-semibold px-2 py-1 rounded block my-2"
          >
            {line}
          </span>
        )
      }
      return (
        <span key={i} className="block my-1">
          {line}
        </span>
      )
    })
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Upload de Exames Laboratoriais</h2>
        <p className="text-muted-foreground">
          Envie o PDF dos exames bioquímicos para análise exata de referências via IA.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!interpretation ? (
        <div
          onClick={() => !isUploading && !isAnalyzing && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors ${isUploading || isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
          {isUploading || isAnalyzing ? (
            <div className="space-y-4">
              <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto" />
              <p className="text-lg font-medium text-primary">
                {isUploading ? 'Fazendo upload do PDF...' : 'IA analisando documento...'}
              </p>
            </div>
          ) : (
            <>
              <UploadCloud className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-primary">
                Arraste o PDF ou clique para selecionar
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Máximo 10MB</p>
            </>
          )}
        </div>
      ) : (
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4 text-primary text-lg">
              <Sparkles className="h-5 w-5" /> Interpretação da IA (Laboratorial)
            </h3>
            <div className="text-sm space-y-2 bg-white p-5 rounded-lg border border-primary/10 shadow-inner max-h-[400px] overflow-y-auto">
              {formatInterpretation(interpretation)}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setInterpretation(null)} variant="outline" className="mr-3">
                Fazer novo upload
              </Button>
              <Button
                onClick={() =>
                  toast({
                    title: 'Salvo',
                    description: 'Interpretação salva no prontuário do paciente.',
                  })
                }
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <CheckCircle2 className="w-4 h-4" /> Salvar interpretação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
