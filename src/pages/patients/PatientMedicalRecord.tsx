import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'

export default function PatientMedicalRecord() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [consultas, setConsultas] = useState<any[]>([])
  const [paciente, setPaciente] = useState<any>(null)
  const [anamneses, setAnamneses] = useState<any[]>([])
  const [prescricoes, setPrescricoes] = useState<any[]>([])
  const [exames, setExames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [deletePatientOpen, setDeletePatientOpen] = useState(false)
  const [anamneseToDelete, setAnamneseToDelete] = useState<string | null>(null)

  const fetchData = async () => {
    if (!patientId) return
    setLoading(true)
    setError(false)
    try {
      const [
        { data: patientData },
        { data: consultasData },
        { data: anamnesesData },
        { data: prescricoesData },
        { data: examesData },
      ] = await Promise.all([
        supabase.from('pacientes').select('*').eq('id', patientId).single(),
        supabase
          .from('consultas')
          .select('*')
          .eq('patient_id', patientId)
          .order('consultation_date', { ascending: false }),
        supabase.from('anamnese').select('*').eq('patient_id', patientId),
        supabase.from('prescricoes').select('*').eq('patient_id', patientId),
        supabase.from('exames').select('*').eq('patient_id', patientId),
      ])
      if (patientData) setPaciente(patientData)
      setConsultas(consultasData || [])
      setAnamneses(anamnesesData || [])
      setPrescricoes(prescricoesData || [])
      setExames(examesData || [])
    } catch (err: any) {
      setError(true)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o prontuário.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [patientId])

  const handleDeletePatient = async () => {
    if (!patientId) return
    const { error } = await supabase.from('pacientes').delete().eq('id', patientId)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir paciente.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Paciente excluído com sucesso.' })
      navigate('/patients')
    }
  }

  const handleDeleteAnamnesis = async () => {
    if (!anamneseToDelete) return
    const { error } = await supabase.from('anamnese').delete().eq('anamnese_id', anamneseToDelete)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir anamnese.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Anamnese excluída com sucesso.' })
      setAnamneseToDelete(null)
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-500 mb-4 font-medium">Erro ao carregar o prontuário.</p>
        <Button onClick={fetchData} className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  if (!paciente)
    return <div className="text-center p-8 text-muted-foreground">Paciente não encontrado.</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/patients')}
            className="text-[#333333] hover:border-[#C5A059]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#001F3F]">
              Prontuário de {paciente.nome_completo}
            </h1>
            <p className="text-muted-foreground text-sm">Histórico completo de consultas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-[#333333] hover:border-[#C5A059]"
            onClick={() => navigate(`/premium-consultation?patient_id=${patientId}#/anamnese`)}
          >
            Editar Anamnese
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDeletePatientOpen(true)}
            className="text-[#C5A059] hover:bg-[#FDFCF0] bg-transparent"
          >
            <Trash2 className="h-5 w-5 mr-2" /> Excluir Paciente
          </Button>
        </div>
      </div>

      {consultas.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
            <FolderOpen className="h-12 w-12 opacity-20" />
            <p>Nenhuma consulta registrada para este paciente.</p>
            <Button
              onClick={() => navigate(`/premium-consultation?patient_id=${patientId}`)}
              className="bg-[#C5A059] hover:bg-[#A88640] text-white"
            >
              Iniciar Consulta
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
            return (
              <Card
                key={consulta.id}
                className="overflow-hidden border-[#001F3F]/10 shadow-sm transition-all hover:shadow-md"
              >
                <CardHeader
                  className="bg-[#001F3F]/5 p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === consulta.id ? null : consulta.id)}
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#001F3F] text-white p-3 rounded-full">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#001F3F]">
                          {consulta.consultation_type}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(consulta.consultation_date), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedId === consulta.id ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                </CardHeader>
                {expandedId === consulta.id && (
                  <CardContent className="p-6 bg-white border-t animate-in slide-in-from-top-2">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold flex items-center gap-2 text-[#001F3F]">
                            <FileText className="h-5 w-5 text-[#C5A059]" /> Dados da Anamnese
                          </h4>
                          {anamnese && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setAnamneseToDelete(anamnese.anamnese_id)
                              }}
                              className="text-[#C5A059] hover:bg-[#FDFCF0]"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir Anamnese
                            </Button>
                          )}
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border">
                          {anamnese ? (
                            <div className="text-sm text-slate-700 whitespace-pre-wrap">
                              {JSON.stringify(anamnese.respostas, null, 2).substring(0, 300)}...
                            </div>
                          ) : (
                            <div className="text-amber-600 text-sm">
                              Nenhuma anamnese vinculada.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <AlertDialog open={deletePatientOpen} onOpenChange={setDeletePatientOpen}>
        <AlertDialogContent className="bg-[#333333] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C5A059]">Excluir Paciente</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza que deseja excluir este paciente? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-gray-300 hover:bg-gray-800 border-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!anamneseToDelete}
        onOpenChange={(open) => !open && setAnamneseToDelete(null)}
      >
        <AlertDialogContent className="bg-[#333333] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C5A059]">Excluir Anamnese</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza que deseja excluir esta anamnese? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-gray-300 hover:bg-gray-800 border-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAnamnesis}
              className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
