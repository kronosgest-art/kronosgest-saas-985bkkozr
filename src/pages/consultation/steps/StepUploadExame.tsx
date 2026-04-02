import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UploadCloud, FileText, Loader2, Save, ArrowRight } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { uploadExame, interpretarExame } from '@/services/ai-functions'

interface StepUploadExameProps {
  tipoExame: 'biorressonancia' | 'laboratorial'
  patientId: string
  onNext: () => void
}

export default function StepUploadExame({ tipoExame, patientId, onNext }: StepUploadExameProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const title =
    tipoExame === 'biorressonancia'
      ? 'Upload - Exame de Biorressonância'
      : 'Upload - Exame Laboratorial'

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!patientId) {
      setError('Paciente não identificado. Conclua o cadastro no Passo 1 primeiro.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo excede o limite de 10MB.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são aceitos.')
      return
    }

    setError(null)
    setIsUploading(true)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1]

        const uploadRes = await uploadExame(patientId, tipoExame, base64String)
        if (uploadRes.error || !uploadRes.data?.exame_id) {
          throw new Error('Erro ao fazer upload. Tente novamente.')
        }

        setIsUploading(false)
        setIsAnalyzing(true)

        const interpretRes = await interpretarExame(
          uploadRes.data.exame_id,
          tipoExame,
          uploadRes.data.url,
        )
        if (interpretRes.error || !interpretRes.data?.interpretacao_ia) {
          throw new Error('Erro ao interpretar exame. Tente novamente.')
        }

        setInterpretation(interpretRes.data.interpretacao_ia)
        toast({
          title: 'Interpretação concluída',
          description: 'A IA finalizou a análise do exame com sucesso.',
        })
      } catch (err: any) {
        setError(err.message || 'Erro inesperado.')
      } finally {
        setIsUploading(false)
        setIsAnalyzing(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  const renderFormattedInterpretation = (text: string) => {
    const parts = text.split(/(ENCAMINHAR AO MÉDICO|Acompanhamento)/gi)
    return (
      <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed mt-4">
        {parts.map((part, index) => {
          const lower = part.toLowerCase()
          if (lower === 'encaminhar ao médico') {
            return (
              <span
                key={index}
                className="bg-yellow-200 text-yellow-900 font-bold px-1 rounded mx-1"
              >
                {part}
              </span>
            )
          }
          if (lower === 'acompanhamento') {
            return (
              <span key={index} className="bg-green-200 text-green-900 font-bold px-1 rounded mx-1">
                {part}
              </span>
            )
          }
          return <span key={index}>{part}</span>
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in-right max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-[#1E3A8A]">{title}</h2>
        <p className="text-muted-foreground text-sm">
          Integração de resultados via PDF com análise de IA em tempo real. (Opcional)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {!interpretation && !isAnalyzing && (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-[#1E3A8A]/30 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors ${!isUploading ? 'cursor-pointer hover:bg-[#1E3A8A]/5' : 'opacity-70'}`}
        >
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-[#1E3A8A] animate-spin mx-auto" />
              <p className="text-lg font-medium text-[#1E3A8A]">Fazendo upload do documento...</p>
            </div>
          ) : (
            <>
              <UploadCloud className="h-12 w-12 text-[#1E3A8A]/50 mb-4" />
              <h3 className="text-lg font-medium text-[#1E3A8A]">Selecionar arquivo PDF</h3>
              <p className="text-sm text-muted-foreground mt-1">Máximo 10MB</p>
            </>
          )}
        </div>
      )}
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {isAnalyzing && (
        <div className="border-2 border-dashed border-[#B8860B]/30 bg-[#B8860B]/5 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-[#B8860B] animate-spin mx-auto" />
            <p className="text-lg font-medium text-[#B8860B]">
              IA do Gemini interpretando exame...
            </p>
            <p className="text-sm text-muted-foreground">
              Isso pode levar alguns segundos dependendo do tamanho do exame.
            </p>
          </div>
        </div>
      )}

      {interpretation && (
        <Card className="border-[#1E3A8A]/20 shadow-sm animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[#B8860B]" />
              <h3 className="text-lg font-bold text-[#1E3A8A]">Interpretação da IA</h3>
            </div>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Tipo: {tipoExame === 'biorressonancia' ? 'Biorressonância' : 'Laboratorial'}
              </p>
              {renderFormattedInterpretation(interpretation)}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Revise a interpretação gerada pela IA.
              </span>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setInterpretation(null)}>
                  Refazer Upload
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: 'Interpretação salva',
                      description: 'Continuando para o próximo passo.',
                    })
                    onNext()
                  }}
                  className="bg-[#1E3A8A] hover:bg-[#152865] text-white"
                >
                  Confirmar e Prosseguir <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
