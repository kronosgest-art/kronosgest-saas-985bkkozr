import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Loader2,
  Save,
  FileDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { QuestionField } from './anamnesis/QuestionField'
import { AnamnesisSummary } from './anamnesis/AnamnesisSummary'
import {
  sectionColors,
  getSectionIcon,
  shouldShowQuestion,
  validateSection,
} from './anamnesis/utils'

interface Step2AnamneseProps {
  data?: any
  onChange?: (data: any) => void
}

export default function Step2Anamnese({ data, onChange }: Step2AnamneseProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [anamneseId, setAnamneseId] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [attemptedNext, setAttemptedNext] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSavedToast, setShowSavedToast] = useState(false)

  const fetchedForPatient = useRef<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  const patientId = data?.patient_id || data?.id || '00000000-0000-0000-0000-000000000000'
  const organizationId = data?.organization_id || null

  useEffect(() => {
    const fetchTemplates = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return
      const { data: tmplData } = await supabase
        .from('anamnese_templates')
        .select('*')
        .or(`profissional_id.eq.${session.user.id},profissional_id.is.null`)
        .order('eh_padrao', { ascending: false })

      if (tmplData && tmplData.length > 0) {
        setTemplates(tmplData)
        if (tmplData.length === 1 || tmplData.find((t: any) => t.eh_padrao)) {
          setSelectedTemplate(tmplData.find((t: any) => t.eh_padrao) || tmplData[0])
        }
      }
    }
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (
      !patientId ||
      patientId === '00000000-0000-0000-0000-000000000000' ||
      templates.length === 0
    )
      return
    if (fetchedForPatient.current === patientId) return
    fetchedForPatient.current = patientId

    supabase
      .from('anamnese')
      .select('*')
      .eq('patient_id', patientId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAnamneseId(data[0].anamnese_id)
          const answersObj: Record<string, any> = {}
          if (Array.isArray(data[0].respostas))
            data[0].respostas.forEach((r: any) => {
              answersObj[r.pergunta_id] = r.resposta
            })
          setAnswers(answersObj)
          if (data[0].template_id) {
            const found = templates.find((t) => t.template_id === data[0].template_id)
            if (found) setSelectedTemplate(found)
          }
        }
      })
  }, [patientId, templates])

  const sections = useMemo(() => {
    if (!selectedTemplate || !selectedTemplate.perguntas) return []
    const secs: any[] = []
    let currentSec: any = null
    selectedTemplate.perguntas.forEach((q: any) => {
      if (q.tipo === 'section') {
        if (currentSec) secs.push(currentSec)
        currentSec = { ...q, perguntas: [] }
      } else {
        if (!currentSec) currentSec = { id: 'default', titulo: 'Geral', perguntas: [] }
        currentSec.perguntas.push(q)
      }
    })
    if (currentSec) secs.push(currentSec)
    return secs
  }, [selectedTemplate])

  const handleAnswerChange = (id: string, value: any) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [id]: value }
      if (id === 'dp_peso' || id === 'dp_alt') {
        const peso = parseFloat(
          String(id === 'dp_peso' ? value : prev['dp_peso']).replace(',', '.'),
        )
        const altCm = parseFloat(String(id === 'dp_alt' ? value : prev['dp_alt']).replace(',', '.'))
        if (!isNaN(peso) && !isNaN(altCm) && altCm > 0) {
          newAnswers['dp_imc'] = (peso / (altCm > 3 ? altCm / 100 : altCm) ** 2).toFixed(2)
        } else newAnswers['dp_imc'] = ''
      }
      if (id === 'dp_cint' || id === 'dp_quad') {
        const cint = parseFloat(
          String(id === 'dp_cint' ? value : prev['dp_cint']).replace(',', '.'),
        )
        const quad = parseFloat(
          String(id === 'dp_quad' ? value : prev['dp_quad']).replace(',', '.'),
        )
        if (!isNaN(cint) && !isNaN(quad) && quad > 0)
          newAnswers['dp_rcq'] = (cint / quad).toFixed(2)
        else newAnswers['dp_rcq'] = ''
      }
      if (onChange) onChange({ anamnese_respostas_temporarias: newAnswers })
      return newAnswers
    })
  }

  const performSave = async (isAuto = false) => {
    if (!selectedTemplate || !patientId || patientId === '00000000-0000-0000-0000-000000000000')
      return
    if (isAuto) setIsAutoSaving(true)
    else setIsSaving(true)
    try {
      const respostasToSave = (selectedTemplate.perguntas || []).map((q: any) => ({
        pergunta_id: q.id,
        resposta: answers[q.id] || '',
      }))
      const payload = {
        patient_id: patientId,
        organization_id: organizationId,
        template_id: selectedTemplate.template_id,
        respostas: respostasToSave,
        atualizado_em: new Date().toISOString(),
      }

      if (anamneseId) await supabase.from('anamnese').update(payload).eq('anamnese_id', anamneseId)
      else {
        const { data: insData } = await supabase
          .from('anamnese')
          .insert(payload)
          .select('anamnese_id')
          .single()
        if (insData) {
          setAnamneseId(insData.anamnese_id)
          if (onChange)
            onChange({ anamnese_id: insData.anamnese_id, anamnese_respostas: respostasToSave })
        }
      }

      setLastSaved(new Date())
      if (isAuto) {
        setShowSavedToast(true)
        setTimeout(() => setShowSavedToast(false), 2000)
      } else
        toast({
          title: 'Anamnese salva',
          description: 'Documento registrado com sucesso no prontuário do paciente.',
        })
    } catch (error: any) {
      if (!isAuto)
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      if (isAuto) setIsAutoSaving(false)
      else setIsSaving(false)
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (Object.keys(answers).length === 0 || !selectedTemplate) return
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => performSave(true), 1500)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [answers])

  const handleNext = () => {
    setAttemptedNext(true)
    if (validateSection(sections[currentStep], answers)) {
      setCurrentStep((prev) => prev + 1)
      setAttemptedNext(false)
      window.scrollTo(0, 0)
    } else
      toast({
        title: 'Campos obrigatórios',
        description:
          'Preencha todos os campos obrigatórios (*) destacados em vermelho para avançar.',
        variant: 'destructive',
      })
  }

  const handleExportPDF = () => {
    if (!selectedTemplate) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Bloqueador de pop-ups bloqueou o PDF.',
        variant: 'destructive',
      })
      return
    }
    let html = `<html><head><title>Anamnese</title><style>body{font-family:sans-serif;padding:40px;color:#1e293b;line-height:1.5;}h1{color:#1E3A8A;text-align:center;}h2{color:#1E3A8A;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:40px;font-size:18px;}.item{margin-bottom:12px;}.question{font-weight:600;font-size:14px;}.answer{margin-top:4px;background:#f8fafc;padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;}</style></head><body><h1>${selectedTemplate.nome_template}</h1>`
    sections.forEach((sec) => {
      html += `<h2>${sec.titulo}</h2>`
      sec.perguntas.forEach((q: any) => {
        const answer = answers[q.id]
        let display = '-'
        if (Array.isArray(answer)) display = answer.length > 0 ? answer.join(', ') : '-'
        else if (answer) display = answer
        html += `<div class="item"><div class="question">${q.titulo}</div><div class="answer">${display}</div></div>`
      })
    })
    html += `</body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Anamnese</h2>
          <p className="text-muted-foreground text-sm">
            Avaliação clínica detalhada com preenchimento guiado por seções.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Modelo:</span>
          {templates.length > 0 ? (
            <Select
              value={selectedTemplate?.template_id || ''}
              onValueChange={(id) => {
                setSelectedTemplate(templates.find((t) => t.template_id === id))
                setCurrentStep(0)
              }}
            >
              <SelectTrigger className="w-[250px]">
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
          ) : (
            <div className="flex gap-2">
              <Select disabled>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Nenhum modelo" />
                </SelectTrigger>
              </Select>
            </div>
          )}
          {selectedTemplate && (
            <Button variant="outline" size="icon" onClick={handleExportPDF} title="Exportar PDF">
              <FileDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {selectedTemplate ? (
        <div className="space-y-6">
          <div className="space-y-3 sticky top-0 z-10 bg-background/95 backdrop-blur py-3 border-b border-border/50">
            <div className="flex justify-between text-sm font-semibold text-primary">
              <span>
                {currentStep < sections.length
                  ? `Seção ${currentStep + 1} de ${sections.length} - ${sections[currentStep].titulo}`
                  : 'Resumo Final'}
              </span>
              <span>{Math.round((currentStep / sections.length) * 100)}%</span>
            </div>
            <Progress value={(currentStep / sections.length) * 100} className="h-2.5" />
            <div className="flex gap-1.5 mt-1">
              {sections.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (idx < currentStep || validateSection(sections[currentStep], answers)) {
                      setCurrentStep(idx)
                      setAttemptedNext(false)
                    }
                  }}
                  className={cn(
                    'h-1.5 flex-1 rounded-full cursor-pointer transition-colors hover:brightness-110',
                    idx === currentStep
                      ? 'bg-primary'
                      : idx < currentStep
                        ? 'bg-primary/50'
                        : 'bg-secondary',
                  )}
                />
              ))}
              <div
                onClick={() => {
                  if (validateSection(sections[currentStep], answers)) {
                    setCurrentStep(sections.length)
                    setAttemptedNext(false)
                  }
                }}
                className={cn(
                  'h-1.5 flex-1 rounded-full cursor-pointer transition-colors',
                  currentStep === sections.length ? 'bg-primary' : 'bg-secondary',
                )}
              />
            </div>
          </div>

          {currentStep < sections.length ? (
            <div className="animate-fade-in-up">
              <div
                className={cn(
                  'p-5 rounded-t-xl border-b flex items-center gap-3 shadow-sm',
                  sectionColors[currentStep % sectionColors.length],
                )}
              >
                {getSectionIcon(sections[currentStep].titulo)}
                <h3 className="text-xl font-bold">{sections[currentStep].titulo}</h3>
              </div>
              <div className="p-4 sm:p-6 border border-t-0 rounded-b-xl bg-card/50 space-y-6 shadow-sm">
                {sections[currentStep].perguntas.map((item: any, idx: number) => {
                  if (!shouldShowQuestion(item, idx, sections[currentStep].perguntas, answers))
                    return null
                  const isError =
                    attemptedNext &&
                    item.obrigatoria &&
                    (!answers[item.id] ||
                      (Array.isArray(answers[item.id]) && answers[item.id].length === 0))
                  const isSuccess =
                    answers[item.id] !== undefined &&
                    answers[item.id] !== '' &&
                    (!Array.isArray(answers[item.id]) || answers[item.id].length > 0)
                  return (
                    <QuestionField
                      key={item.id}
                      item={item}
                      answer={answers[item.id]}
                      onChange={handleAnswerChange}
                      isError={!!isError}
                      isSuccess={!!isSuccess}
                    />
                  )
                })}
              </div>
            </div>
          ) : (
            <AnamnesisSummary
              sections={sections}
              answers={answers}
              onEdit={(idx) => setCurrentStep(idx)}
            />
          )}

          <div className="flex justify-between items-center pt-8 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep((p) => Math.max(0, p - 1))
                setAttemptedNext(false)
                window.scrollTo(0, 0)
              }}
              disabled={currentStep === 0}
              className="px-6 h-12"
            >
              <ChevronLeft className="w-5 h-5 mr-2" /> Voltar
            </Button>
            <div className="hidden sm:flex text-xs text-muted-foreground items-center gap-2 font-medium">
              {isAutoSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Salvando progresso...
                </>
              ) : lastSaved ? (
                <>
                  <Check className="w-4 h-4 text-green-500" /> Salvo{' '}
                  {lastSaved.toLocaleTimeString()}
                </>
              ) : null}
            </div>
            {currentStep < sections.length ? (
              <Button
                onClick={handleNext}
                className="px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-semibold text-base"
              >
                Próximo <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => performSave(false)}
                disabled={isSaving}
                className="px-8 h-12 bg-green-600 hover:bg-green-700 text-white shadow-md font-semibold text-base"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}{' '}
                Confirmar e Salvar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-card/50">
          Selecione um modelo para iniciar a anamnese guiada.
        </div>
      )}

      {showSavedToast && lastSaved && (
        <div className="fixed bottom-6 right-6 bg-green-100 border border-green-200 text-green-800 px-5 py-3 rounded-full shadow-lg flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 z-50">
          <CheckCircle2 className="w-5 h-5" /> Salvo automaticamente em{' '}
          {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
