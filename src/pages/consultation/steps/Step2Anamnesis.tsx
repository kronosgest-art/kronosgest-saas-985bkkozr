import { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2, Loader2, UploadCloud, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { analyzeBioresonance } from '@/services/ai-functions'

export default function Step2Anamnesis() {
  const [questions, setQuestions] = useState([
    { id: 1, type: 'text', q: 'Qual a queixa principal?' },
    { id: 2, type: 'scale', q: 'Nível de dor (1 a 10)?', value: [5] },
    { id: 3, type: 'radio', q: 'Faz uso de medicação contínua?' },
  ])
  const [answers, setAnswers] = useState<Record<number, any>>({
    1: '',
    2: [5],
    3: 'nao',
  })

  // IA Biorressonância States
  const [patientId, setPatientId] = useState<string>('00000000-0000-0000-0000-000000000000')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Busca um paciente válido para testes de integração caso não seja passado via props
    supabase
      .from('patients')
      .select('id')
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setPatientId(data[0].id)
      })
  }, [])

  const handleAnswerChange = (id: number, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo excede o limite de 10MB.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Por favor, envie apenas arquivos no formato PDF.')
      return
    }

    setError(null)
    setIsAnalyzing(true)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1]
        const res = await analyzeBioresonance(base64String, patientId)

        if (res.error) {
          setError('Erro de conexão ao processar arquivo.')
        } else if (res.data?.error) {
          setError(res.data.error)
        } else {
          setAnalysisResult(res.data?.data)
          setPdfUrl(res.data?.pdf_url)
        }
      } catch (err) {
        setError('Erro inesperado ao analisar o exame.')
      } finally {
        setIsAnalyzing(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-8 animate-slide-in-right">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#1E3A8A' }}>
            Anamnese Editável
          </h2>
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
                value={answers[item.id]}
                onChange={(e) => handleAnswerChange(item.id, e.target.value)}
              />
            )}
            {item.type === 'scale' && (
              <div className="pt-4 px-2">
                <Slider
                  value={answers[item.id]}
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
                value={answers[item.id]}
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

      {/* IA Biorressonância Upload */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#1E3A8A' }}>
          Biorressonância
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Faça o upload do laudo em PDF para extração automática de frequências críticas.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <div>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              style={{ backgroundColor: '#B8860B', color: '#1E3A8A' }}
              className="hover:opacity-90 font-semibold"
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              {isAnalyzing ? 'Processando...' : '📤 Upload PDF'}
            </Button>
            <p className="text-xs text-slate-500 mt-2">Apenas PDF (máx 10MB)</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-4 bg-red-50 p-3 rounded border border-red-100">
              {error}
            </p>
          )}

          {analysisResult && (
            <div className="mt-6 space-y-4 animate-fade-in-up">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium flex items-center mb-4" style={{ color: '#1E3A8A' }}>
                  <FileText className="w-4 h-4 mr-2" /> Resultados da Análise
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="block text-slate-700 mb-1">Alterações:</strong>
                    <ul className="list-disc pl-5 text-slate-600">
                      {analysisResult.alteracoes?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="block text-slate-700 mb-1">Frequências Críticas:</strong>
                    <ul className="list-disc pl-5 text-slate-600">
                      {analysisResult.frequencias_criticas?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="block text-slate-700 mb-1">Recomendações:</strong>
                    <ul className="list-disc pl-5 text-slate-600">
                      {analysisResult.recomendacoes?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 p-3 rounded text-xs font-medium border border-blue-100 gap-4"
                style={{ color: '#1E3A8A' }}
              >
                <span>⚠️ Este é um exame biofísico, não é diagnóstico médico</span>
                {pdfUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={pdfUrl} target="_blank" rel="noreferrer">
                      📥 Download PDF Analisado
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
