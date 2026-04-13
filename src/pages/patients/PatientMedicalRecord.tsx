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
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch patient
        const { data: patientData, error: patientError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', patientId)
          .single()

        if (patientError) throw patientError
        setPaciente(patientData)

        // Fetch consultas
        const { data: consultasData, error: consultasError } = await (supabase as any)
          .from('consultas')
          .select('*')
          .eq('patient_id', patientId)
          .order('consultation_date', { ascending: false })

        if (consultasError) throw consultasError
        setConsultas(consultasData || [])
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
          {consultas.map((consulta) => (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Anamnese Status */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-[#001F3F]">
                        <FileText className="h-4 w-4 text-[#D4AF37]" /> Status da Anamnese
                      </h4>
                      <div className="p-3 bg-slate-50 rounded-md border text-sm h-full">
                        {consulta.data_collected?.anamnese_id ? (
                          <div className="text-green-600 font-medium">
                            Anamnese preenchida e vinculada
                          </div>
                        ) : (
                          <div className="text-amber-600 font-medium">
                            Anamnese não vinculada nesta consulta
                          </div>
                        )}
                        {consulta.data_collected?.tcle_assinado && (
                          <div className="mt-2 text-slate-600">✓ TCLE Assinado</div>
                        )}
                      </div>
                    </div>

                    {/* Exames Associados */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-[#001F3F]">
                        <BrainCircuit className="h-4 w-4 text-[#D4AF37]" /> Exames e Avaliações
                      </h4>
                      <div className="p-3 bg-slate-50 rounded-md border text-sm h-full">
                        {consulta.data_collected?.exames_ids &&
                        consulta.data_collected.exames_ids.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 text-slate-700">
                            {consulta.data_collected.exames_ids.map(
                              (exameId: string, i: number) => (
                                <li key={i}>Exame ID: {exameId.substring(0, 8)}...</li>
                              ),
                            )}
                          </ul>
                        ) : (
                          <div className="text-slate-500">Nenhum exame vinculado</div>
                        )}
                      </div>
                    </div>

                    {/* Prescrições */}
                    <div className="space-y-3 md:col-span-2">
                      <h4 className="font-semibold flex items-center gap-2 text-[#001F3F]">
                        <FileSignature className="h-4 w-4 text-[#D4AF37]" /> Prescrições e
                        Encaminhamentos
                      </h4>
                      <div className="p-3 bg-slate-50 rounded-md border text-sm">
                        {consulta.data_collected?.prescricao_id ? (
                          <div className="text-slate-700">
                            ✓ Prescrição gerada (ID:{' '}
                            {consulta.data_collected.prescricao_id.substring(0, 8)}...)
                          </div>
                        ) : (
                          <div className="text-slate-500">Nenhuma prescrição gerada</div>
                        )}
                        {consulta.data_collected?.encaminhamento && (
                          <div className="mt-2 pt-2 border-t text-slate-700">
                            <span className="font-medium">Encaminhamento:</span>{' '}
                            {consulta.data_collected.encaminhamento}
                          </div>
                        )}
                        {consulta.data_collected?.agendamento_id && (
                          <div className="mt-2 text-slate-700">✓ Retorno agendado</div>
                        )}
                      </div>
                    </div>

                    {/* Raw Data */}
                    <div className="space-y-3 md:col-span-2">
                      <details>
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary">
                          Ver dados completos da consulta
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
          ))}
        </div>
      )}
    </div>
  )
}
