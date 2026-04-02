import { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, FileText, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { analyzeBioresonance } from '@/services/ai-functions'
import { toast } from '@/hooks/use-toast'

interface Step2AnamnesisProps {
  data?: any
  onChange?: (data: any) => void
}

export default function Step2Anamnesis({ data, onChange }: Step2AnamnesisProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [anamneseId, setAnamneseId] = useState<string | null>(null)
  const fetchedForPatient = useRef<string | null>(null)

  // IA Biorressonância States
  const [patientId, setPatientId] = useState<string>('00000000-0000-0000-0000-000000000000')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (data?.patient_id || data?.id) {
      setPatientId(data.patient_id || data.id)
    } else {
      supabase
        .from('patients')
        .select('id')
        .limit(1)
        .then(({ data: pts }) => {
          if (pts && pts.length > 0) setPatientId(pts[0].id)
        })
    }
  }, [data])

  useEffect(() => {
    const fetchTemplates = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { data: tmplData } = await supabase
        .from('anamnese_templates')
        .select('*')
        .eq('profissional_id', session.user.id)
        .order('eh_padrao', { ascending: false })

      if (tmplData && tmplData.length > 0) {
        setTemplates(tmplData)
        const defaultTemplate = tmplData.find((t: any) => t.eh_padrao) || tmplData[0]
        setSelectedTemplate(defaultTemplate)
      }
    }
    fetchTemplates()
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchExistingAnamnesis = async () => {
      if (!patientId || patientId === '00000000-0000-0000-0000-000000000000') return
      if (fetchedForPatient.current === patientId) return

      fetchedForPatient.current = patientId

      const { data, error } = await supabase
        .from('anamnese')
        .select('*')
        .eq('patient_id', patientId)
        .order('criado_em', { ascending: false })
        .limit(1)

      if (data && data.length > 0 && isMounted) {
        setAnamneseId(data[0].anamnese_id)

        const answersObj: Record<string, any> = {}
        if (Array.isArray(data[0].respostas)) {
          data[0].respostas.forEach((r: any) => {
            answersObj[r.pergunta_id] = r.resposta
          })
        }
        setAnswers(answersObj)

        if (data[0].template_id && templates.length > 0) {
          const found = templates.find((t) => t.template_id === data[0].template_id)
          if (found) setSelectedTemplate(found)
        }
      } else if (isMounted) {
        setAnamneseId(null)
        setAnswers({})
      }
    }

    if (templates.length > 0) {
      fetchExistingAnamnesis()
    }

    return () => {
      isMounted = false
    }
  }, [patientId, templates])

  const handleTemplateChange = (templateId: string) => {
    const newTemplate = templates.find((t) => t.template_id === templateId)
    if (newTemplate) {
      setSelectedTemplate(newTemplate)
    }
  }

  const handleAnswerChange = (id: string, value: any) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [id]: value }
      if (onChange) {
        onChange({ anamnese_respostas_temporarias: newAnswers })
      }
      return newAnswers
    })
  }

  const handleSaveAnamnese = async () => {
    if (!selectedTemplate) return
    if (!patientId || patientId === '00000000-0000-0000-0000-000000000000') {
      toast({
        title: 'Paciente inválido',
        description: 'Selecione ou cadastre um paciente no passo 1 antes de salvar a anamnese.',
        variant: 'destructive',
      })
      return
    }

    const perguntas = selectedTemplate.perguntas || []
    for (const q of perguntas) {
      if (q.obrigatoria) {
        const val = answers[q.id]
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          toast({
            title: 'Campo obrigatório',
            description: `A pergunta "${q.titulo}" é obrigatória.`,
            variant: 'destructive',
          })
          return
        }
      }
    }

    const respostasToSave = perguntas.map((q: any) => ({
      pergunta_id: q.id,
      resposta: answers[q.id] || '',
    }))

    setIsSaving(true)
    try {
      const payload = {
        patient_id: patientId,
        template_id: selectedTemplate.template_id,
        respostas: respostasToSave,
        atualizado_em: new Date().toISOString(),
      }

      if (anamneseId) {
        const { error } = await supabase
          .from('anamnese')
          .update(payload)
          .eq('anamnese_id', anamneseId)
        if (error) throw error
      } else {
        const { data: insData, error } = await supabase
          .from('anamnese')
          .insert(payload)
          .select('anamnese_id')
          .single()
        if (error) throw error
        if (insData) {
          setAnamneseId(insData.anamnese_id)
          if (onChange) {
            onChange({ anamnese_id: insData.anamnese_id, anamnese_respostas: respostasToSave })
          }
        }
      }

      toast({
        title: 'Anamnese salva',
        description: 'Os dados foram salvos com sucesso no prontuário do paciente.',
      })
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#1E3A8A' }}>
            Anamnese
          </h2>
          <p className="text-muted-foreground">Avaliação clínica baseada em modelo.</p>
        </div>

        {templates.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Modelo:</span>
            <Select
              value={selectedTemplate?.template_id || ''}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="w-[200px] border-[#B8860B] text-[#B8860B] focus:ring-[#B8860B]">
                <SelectValue placeholder="Escolher Modelo" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.template_id} value={t.template_id}>
                    {t.nome_template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {selectedTemplate ? (
          selectedTemplate.perguntas?.map((item: any) => {
            if (item.tipo === 'section') {
              return (
                <div key={item.id} className="mt-8 mb-4">
                  <h3 className="text-xl font-bold text-[#1E3A8A] border-b border-blue-100 pb-2">
                    {item.titulo}
                  </h3>
                </div>
              )
            }

            return (
              <div key={item.id} className="p-4 border rounded-lg bg-card shadow-sm relative group">
                <Label className="text-base font-medium mb-3 flex items-center gap-2">
                  {item.titulo}
                  {item.obrigatoria && <span className="text-destructive">*</span>}
                </Label>

                {(item.tipo === 'text' ||
                  item.tipo === 'date' ||
                  item.tipo === 'number' ||
                  item.tipo === 'email' ||
                  item.tipo === 'tel') && (
                  <div className="mt-2">
                    <input
                      type={item.tipo}
                      placeholder={item.placeholder || 'Resposta...'}
                      value={answers[item.id] || ''}
                      onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}

                {(item.tipo === 'textarea' || (!item.tipo && item.tipo !== 'section')) && (
                  <Textarea
                    placeholder={item.placeholder || 'Resposta do paciente...'}
                    value={answers[item.id] || ''}
                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                )}

                {item.tipo === 'select' && item.opcoes && (
                  <div className="mt-2">
                    <Select
                      value={answers[item.id] || ''}
                      onValueChange={(val) => handleAnswerChange(item.id, val)}
                    >
                      <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        {item.opcoes.map((op: string, i: number) => (
                          <SelectItem key={i} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {item.tipo === 'radio' && item.opcoes && (
                  <RadioGroup
                    value={answers[item.id] || ''}
                    onValueChange={(val) => handleAnswerChange(item.id, val)}
                    className="flex flex-col space-y-2 mt-2"
                  >
                    {item.opcoes.map((op: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2">
                        <RadioGroupItem value={op} id={`${item.id}-op-${i}`} />
                        <Label htmlFor={`${item.id}-op-${i}`}>{op}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {item.tipo === 'checkbox' && (
                  <div className="flex flex-col space-y-2 mt-2">
                    {item.opcoes && item.opcoes.length > 0 ? (
                      item.opcoes.map((op: string, i: number) => {
                        const isChecked = (answers[item.id] || []).includes(op)
                        return (
                          <div key={i} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${item.id}-cb-${i}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentArr = answers[item.id] || []
                                let newArr
                                if (checked) {
                                  newArr = [...currentArr, op]
                                } else {
                                  newArr = currentArr.filter((v: string) => v !== op)
                                }
                                handleAnswerChange(item.id, newArr)
                              }}
                            />
                            <Label htmlFor={`${item.id}-cb-${i}`}>{op}</Label>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${item.id}-cb-single`}
                          checked={answers[item.id] === 'Sim' || answers[item.id] === true}
                          onCheckedChange={(checked) => {
                            handleAnswerChange(item.id, checked ? 'Sim' : 'Não')
                          }}
                        />
                        <Label htmlFor={`${item.id}-cb-single`}>Sim</Label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhum modelo de anamnese selecionado ou disponível.
          </div>
        )}
      </div>

      {selectedTemplate && selectedTemplate.perguntas && selectedTemplate.perguntas.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSaveAnamnese}
            disabled={isSaving}
            className="bg-[#1E3A8A] hover:bg-[#152865] text-white px-8"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar Anamnese'}
          </Button>
        </div>
      )}

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
