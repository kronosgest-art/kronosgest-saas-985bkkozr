import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FolderOpen,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Stethoscope,
  FileSignature,
  ArrowLeft,
  BrainCircuit,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'

interface Consulta {
  id: string
  patient_id: string
  consultation_type: string
  consultation_date: string
  status: string
  data_collected: any
  created_at: string
}

export default function PatientMedicalRecord() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [paciente, setPaciente] = useState<any>(null)

  // Detalhes vinculados
  const [anamneses, setAnamneses] = useState<any[]>([])
  const [prescricoes, setPrescricoes] = useState<any[]>([])
  const [exames, setExames] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [
          { data: patientData, error: patientError },
          { data: consultasData, error: consultasError },
          { data: anamnesesData },
          { data: prescricoesData },
          { data: examesData },
        ] = await Promise.all([
          supabase.from('pacientes').select('*').eq('id', patientId).single(),
          (supabase as any)
            .from('consultas')
            .select('*')
            .eq('patient_id', patientId)
            .order('consultation_date', { ascending: false }),
          supabase.from('anamnese').select('*').eq('patient_id', patientId),
          supabase.from('prescricoes').select('*').eq('patient_id', patientId),
          supabase.from('exames').select('*').eq('patient_id', patientId),
        ])

        if (patientError) throw patientError
        setPaciente(patientData)

        if (consultasError) throw consultasError
        setConsultas(consultasData || [])

        setAnamneses(anamnesesData || [])
        setPrescricoes(prescricoesData || [])
        setExames(examesData || [])
      } catch (err: any) {
        console.error('Error fetching medical record:', err)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o prontuário.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [patientId])

  const renderAnamneseRespostas = (respostas: any) => {
    if (!respostas) return null
    const entries = Object.entries(respostas).filter(
      ([_, v]) =>
        v !== null && v !== '' && v !== undefined && (Array.isArray(v) ? v.length > 0 : true),
    )

    if (entries.length === 0)
      return <div className="text-slate-500 mt-2 text-sm">Nenhuma resposta preenchida.</div>

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {entries.map(([key, value]: [string, any]) => {
          let displayValue = value
          if (Array.isArray(value)) {
            displayValue = value.join(', ')
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value)
          }

          const readableKey = key.replace(/^(dp|qp|hs|av|ev|qe|obs)_/, '').replace(/_/g, ' ')

          return (
            <div key={key} className="bg-white p-2 rounded border text-sm shadow-sm">
              <span className="text-slate-400 text-xs block capitalize mb-1">{readableKey}</span>
              <span className="font-medium text-slate-700">{displayValue}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Carregando prontuário...
      </div>
    )
  }

  if (!paciente) {
    return <div className="text-center p-8 text-muted-foreground">Paciente não encontrado.</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#001F3F]">
            Prontuário de {paciente.nome_completo}
          </h1>
          <p className="text-muted-foreground text-sm">
            Histórico completo de consultas e procedimentos
          </p>
        </div>
      </div>

      {consultas.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
            <FolderOpen className="h-12 w-12 opacity-20" />
            <p>Nenhuma consulta registrada para este paciente.</p>
            <Button
              onClick={() => navigate(`/premium-consultation?patient_id=${patientId}`)}
              className="bg-[#D4AF37] hover:bg-[#B8860B] text-white"
            >
              Iniciar Consulta Premium
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultas.map((consulta) => {
            const anamnese = anamneses.find(
              (a) => a.anamnese_id === consulta.data_collected?.anamnese_id,
            )
            const prescricao = prescricoes.find(
              (p) => p.id === consulta.data_collected?.prescricao_id,
            )
            const consultaExames = consulta.data_collected?.exames_ids
              ? exames.filter((e) => consulta.data_collected.exames_ids.includes(e.id))
              : []

            return (
              <Card
                key={consulta.id}
                className="overflow-hidden border-[#001F3F]/10 shadow-sm transition-all hover:shadow-md"
              >
                <CardHeader
                  className="bg-[#001F3F]/5 p-4 sm:px-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === consulta.id ? null : consulta.id)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#001F3F] text-white p-3 rounded-full">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg text-[#001F3F]">
                            {consulta.consultation_type}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={
                              consulta.status === 'Finalizada'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : ''
                            }
                          >
                            {consulta.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(consulta.consultation_date), "dd 'de' MMMM, yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(consulta.consultation_date), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/premium-consultation?patient_id=${patientId}#/anamnese`)
                        }}
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Editar Anamnese
                      </Button>
                      <Button variant="ghost" size="sm">
                        {expandedId === consulta.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedId === consulta.id && (
                  <CardContent className="p-4 sm:p-6 bg-white border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Anamnese Status & Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-[#001F3F]">
                          <FileText className="h-5 w-5 text-[#D4AF37]" /> Dados da Anamnese
                        </h4>
                        <div className="p-4 bg-slate-50 rounded-lg border">
                          {anamnese ? (
                            <>
                              <div className="text-green-600 font-medium text-sm mb-2 flex items-center gap-1">
                                ✓ Anamnese preenchida
                              </div>
                              {renderAnamneseRespostas(anamnese.respostas)}
                            </>
                          ) : (
                            <div className="text-amber-600 font-medium text-sm">
                              Nenhuma anamnese vinculada a esta consulta.
                            </div>
                          )}
                          {consulta.data_collected?.tcle_assinado && (
                            <div className="mt-4 text-sm text-slate-700 font-medium flex items-center gap-1">
                              ✓ TCLE Assinado pelo paciente
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Exames Associados */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-[#001F3F]">
                          <BrainCircuit className="h-5 w-5 text-[#D4AF37]" /> Exames e Avaliações
                        </h4>
                        <div className="p-4 bg-slate-50 rounded-lg border">
                          {consultaExames.length > 0 ? (
                            <div className="space-y-4">
                              {consultaExames.map((exame) => (
                                <div
                                  key={exame.id}
                                  className="bg-white p-4 rounded border text-sm shadow-sm"
                                >
                                  <div className="flex justify-between items-center mb-3">
                                    <div className="font-semibold text-[#001F3F] capitalize text-base">
                                      {exame.tipo}
                                    </div>
                                    {exame.arquivo_pdf_url && (
                                      <a
                                        href={exame.arquivo_pdf_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#D4AF37] hover:text-[#B8860B] flex items-center gap-1 font-medium bg-[#D4AF37]/10 px-2 py-1 rounded"
                                      >
                                        <ExternalLink className="h-3 w-3" /> Ver Documento Original
                                      </a>
                                    )}
                                  </div>

                                  {exame.interpretacao_ia && (
                                    <div className="mb-3 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                                      <strong className="text-blue-900 block mb-1 text-xs uppercase tracking-wider">
                                        Interpretação IA:
                                      </strong>
                                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                        {exame.interpretacao_ia}
                                      </p>
                                    </div>
                                  )}

                                  {exame.resultado_json && (
                                    <details>
                                      <summary className="text-xs text-slate-500 cursor-pointer hover:text-[#D4AF37]">
                                        Ver dados extraídos do exame
                                      </summary>
                                      <pre className="mt-2 text-xs bg-slate-100 p-3 rounded overflow-x-auto text-slate-600">
                                        {JSON.stringify(exame.resultado_json, null, 2)}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-500 text-sm">
                              Nenhum exame vinculado nesta consulta.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prescrições */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-[#001F3F]">
                          <FileSignature className="h-5 w-5 text-[#D4AF37]" /> Prescrições e
                          Encaminhamentos
                        </h4>
                        <div className="p-4 bg-slate-50 rounded-lg border">
                          {prescricao ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <div className="text-green-600 font-medium text-sm flex items-center gap-1">
                                  ✓ Prescrição gerada
                                </div>
                                {prescricao.arquivo_pdf_url && (
                                  <a
                                    href={prescricao.arquivo_pdf_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#D4AF37] hover:text-[#B8860B] flex items-center gap-1 font-medium bg-[#D4AF37]/10 px-2 py-1 rounded text-sm"
                                  >
                                    <ExternalLink className="h-3 w-3" /> Ver Receituário (PDF)
                                  </a>
                                )}
                              </div>

                              {prescricao.conteudo_json && (
                                <div className="bg-white p-4 rounded border shadow-sm text-sm space-y-4">
                                  {prescricao.conteudo_json.prescricao && (
                                    <div>
                                      <strong className="text-slate-900 block mb-1 text-xs uppercase tracking-wider">
                                        Fórmula/Medicação:
                                      </strong>
                                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed bg-slate-50 p-3 rounded">
                                        {prescricao.conteudo_json.prescricao}
                                      </p>
                                    </div>
                                  )}
                                  {prescricao.conteudo_json.posologia && (
                                    <div>
                                      <strong className="text-slate-900 block mb-1 text-xs uppercase tracking-wider">
                                        Posologia:
                                      </strong>
                                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed bg-slate-50 p-3 rounded">
                                        {prescricao.conteudo_json.posologia}
                                      </p>
                                    </div>
                                  )}
                                  {prescricao.conteudo_json.avisos &&
                                    Array.isArray(prescricao.conteudo_json.avisos) &&
                                    prescricao.conteudo_json.avisos.length > 0 && (
                                      <div>
                                        <strong className="text-amber-900 block mb-1 text-xs uppercase tracking-wider">
                                          Orientações/Avisos:
                                        </strong>
                                        <ul className="list-disc pl-5 space-y-1 text-amber-800 bg-amber-50 p-3 rounded">
                                          {prescricao.conteudo_json.avisos.map(
                                            (aviso: string, i: number) => (
                                              <li key={i}>{aviso}</li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-slate-500 text-sm">Nenhuma prescrição gerada.</div>
                          )}

                          {consulta.data_collected?.encaminhamento && (
                            <div className="mt-4 pt-4 border-t text-sm">
                              <strong className="text-slate-900 block mb-1 text-xs uppercase tracking-wider">
                                Encaminhamento:
                              </strong>
                              <p className="text-slate-700 bg-white p-3 rounded border shadow-sm">
                                {consulta.data_collected.encaminhamento}
                              </p>
                            </div>
                          )}

                          {consulta.data_collected?.agendamento_id && (
                            <div className="mt-4 pt-4 border-t text-sm text-slate-700 font-medium flex items-center gap-1">
                              ✓ Retorno agendado com sucesso
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Raw Data Fallback */}
                      <div className="pt-2">
                        <details>
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary">
                            Ver dados técnicos originais (JSON)
                          </summary>
                          <pre className="mt-2 p-3 bg-slate-900 text-slate-50 rounded-md text-xs overflow-x-auto">
                            {JSON.stringify(consulta.data_collected, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
