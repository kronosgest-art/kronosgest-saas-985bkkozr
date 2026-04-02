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
import { Loader2, Save, FileDown } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

interface Step2AnamneseProps {
  data?: any
  onChange?: (data: any) => void
}

export default function Step2Anamnese({ data, onChange }: Step2AnamneseProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [anamneseId, setAnamneseId] = useState<string | null>(null)
  const fetchedForPatient = useRef<string | null>(null)

  const [patientId, setPatientId] = useState<string>('00000000-0000-0000-0000-000000000000')
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    if (data?.patient_id || data?.id) {
      const pid = data.patient_id || data.id
      setPatientId(pid)
      supabase
        .from('pacientes')
        .select('organization_id')
        .eq('id', pid)
        .single()
        .then(({ data: p }) => {
          if (p?.organization_id) setOrganizationId(p.organization_id)
        })
    } else {
      setPatientId('00000000-0000-0000-0000-000000000000')
      setOrganizationId(null)
    }
  }, [data?.patient_id, data?.id])

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
        const defaultTemplate = tmplData.find((t: any) => t.eh_padrao) || tmplData[0]
        setSelectedTemplate(defaultTemplate)
      } else {
        setTemplates([])
        setSelectedTemplate(null)
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

      // Auto calculations for IMC
      if (id === 'dp_peso' || id === 'dp_alt') {
        const pesoStr = id === 'dp_peso' ? value : prev['dp_peso']
        const altStr = id === 'dp_alt' ? value : prev['dp_alt']

        if (pesoStr && altStr) {
          const peso = parseFloat(String(pesoStr).replace(',', '.'))
          const altCm = parseFloat(String(altStr).replace(',', '.'))

          if (!isNaN(peso) && !isNaN(altCm) && altCm > 0) {
            const altM = altCm > 3 ? altCm / 100 : altCm
            newAnswers['dp_imc'] = (peso / (altM * altM)).toFixed(2)
          } else {
            newAnswers['dp_imc'] = ''
          }
        }
      }

      // Auto calculations for RCQ
      if (id === 'dp_cint' || id === 'dp_quad') {
        const cintStr = id === 'dp_cint' ? value : prev['dp_cint']
        const quadStr = id === 'dp_quad' ? value : prev['dp_quad']

        if (cintStr && quadStr) {
          const cint = parseFloat(String(cintStr).replace(',', '.'))
          const quad = parseFloat(String(quadStr).replace(',', '.'))

          if (!isNaN(cint) && !isNaN(quad) && quad > 0) {
            newAnswers['dp_rcq'] = (cint / quad).toFixed(2)
          } else {
            newAnswers['dp_rcq'] = ''
          }
        }
      }

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
        organization_id: organizationId,
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

  const handleExportPDF = () => {
    if (!selectedTemplate) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Bloqueador de pop-ups pode estar ativo.',
        variant: 'destructive',
      })
      return
    }

    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Anamnese - ${selectedTemplate.nome_template}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            h1 { color: #1E3A8A; text-align: center; margin-bottom: 30px; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            h2 { color: #1E3A8A; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 40px; font-size: 18px; }
            .item { margin-bottom: 12px; page-break-inside: avoid; }
            .question { font-weight: 600; color: #475569; font-size: 14px; }
            .answer { margin-top: 4px; color: #0f172a; font-size: 15px; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; min-height: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .full-width { grid-column: 1 / -1; }
            @media print {
              body { padding: 0; }
              .answer { border: 1px solid #cbd5e1; background: none; }
            }
          </style>
        </head>
        <body>
          <h1>${selectedTemplate.nome_template}</h1>
    `

    let inGrid = false

    selectedTemplate.perguntas.forEach((q: any) => {
      if (q.tipo === 'section') {
        if (inGrid) {
          html += `</div>`
          inGrid = false
        }
        html += `<h2>${q.titulo}</h2><div class="grid">`
        inGrid = true
      } else {
        const answer = answers[q.id]
        let displayAnswer = '-'
        if (Array.isArray(answer)) {
          displayAnswer = answer.length > 0 ? answer.join(', ') : '-'
        } else if (answer !== undefined && answer !== null && answer !== '') {
          displayAnswer = answer
        }

        const isFullWidth = q.tipo === 'textarea' || q.tipo === 'checkbox'

        html += `
          <div class="item ${isFullWidth ? 'full-width' : ''}">
            <div class="question">${q.titulo}</div>
            <div class="answer">${displayAnswer}</div>
          </div>
        `
      }
    })

    if (inGrid) {
      html += `</div>`
    }

    html += `
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
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

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Modelo:</span>
          {templates.length > 0 ? (
            <Select
              value={selectedTemplate?.template_id || ''}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="w-[250px] border-[#B8860B] text-[#B8860B] focus:ring-[#B8860B]">
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
            <div className="flex items-center gap-2">
              <Select disabled>
                <SelectTrigger className="w-[250px] border-muted text-muted-foreground">
                  <SelectValue placeholder="Nenhum modelo disponível" />
                </SelectTrigger>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/settings/anamnesis-templates', '_blank')}
                className="border-[#1E3A8A] text-[#1E3A8A]"
              >
                Criar Novo
              </Button>
            </div>
          )}
        </div>
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

            const isCalculated = item.id === 'dp_imc' || item.id === 'dp_rcq'

            return (
              <div key={item.id} className="p-4 border rounded-lg bg-card shadow-sm relative group">
                <Label className="text-base font-medium mb-3 flex items-center gap-2">
                  {item.titulo}
                  {item.obrigatoria && <span className="text-destructive">*</span>}
                  {isCalculated && (
                    <span className="text-xs text-muted-foreground font-normal">(Auto)</span>
                  )}
                </Label>

                {(item.tipo === 'text' ||
                  item.tipo === 'date' ||
                  item.tipo === 'number' ||
                  item.tipo === 'email' ||
                  item.tipo === 'tel') && (
                  <div className="mt-2">
                    <input
                      type={item.tipo === 'number' ? 'text' : item.tipo}
                      inputMode={item.tipo === 'number' ? 'decimal' : undefined}
                      placeholder={item.placeholder || 'Resposta...'}
                      value={answers[item.id] || ''}
                      readOnly={isCalculated}
                      onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isCalculated
                          ? 'bg-muted text-muted-foreground cursor-default'
                          : 'bg-background'
                      }`}
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
        <div className="flex flex-col sm:flex-row justify-end mt-4 gap-4">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/10 w-full sm:w-auto"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            onClick={handleSaveAnamnese}
            disabled={isSaving}
            className="bg-[#1E3A8A] hover:bg-[#152865] text-white px-8 w-full sm:w-auto"
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
    </div>
  )
}
