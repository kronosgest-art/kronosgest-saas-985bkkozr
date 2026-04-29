import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, LogOut, FileText, Info, CheckCircle2, UserCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [patient, setPatient] = useState<any>(null)
  const [sessoes, setSessoes] = useState<any[]>([])
  const [anamneses, setAnamneses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionStr = localStorage.getItem('patient_session')
    if (!sessionStr) {
      navigate('/patient-login')
      return
    }
    const p = JSON.parse(sessionStr)
    setPatient(p)

    const loadData = async () => {
      const patientId = p.paciente_id || p.id
      const [{ data: sData }, { data: aData }] = await Promise.all([
        supabase
          .from('agendamentos')
          .select('*')
          .eq('patient_id', patientId)
          .order('data', { ascending: true }),
        supabase.from('anamnese').select('*').eq('patient_id', patientId),
      ])
      if (sData) setSessoes(sData)
      if (aData) setAnamneses(aData)
      setLoading(false)
    }
    loadData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('patient_session')
    navigate('/patient-login')
  }

  const handleConfirmPresence = async (id: string) => {
    const { error } = await supabase
      .from('agendamentos')
      .update({ status: 'Confirmado' })
      .eq('id', id)
    if (!error) {
      toast({
        title: 'Presença confirmada!',
        description: 'Sua confirmação foi registrada com sucesso.',
      })
      setSessoes((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Confirmado' } : s)))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF0] p-8 space-y-4">
        <Skeleton className="h-12 w-1/3 bg-[#001F3F]/10" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-32 bg-[#001F3F]/10" />
          <Skeleton className="h-32 bg-[#001F3F]/10" />
          <Skeleton className="h-32 bg-[#001F3F]/10" />
        </div>
        <Skeleton className="h-64 bg-[#001F3F]/10" />
      </div>
    )
  }

  if (!patient) return null

  const now = new Date()
  const futuras = sessoes.filter((s) => new Date(`${s.data}T${s.horario}`) >= now)
  const historico = sessoes.filter((s) => new Date(`${s.data}T${s.horario}`) < now)
  const ultimaConsulta = historico.length > 0 ? historico[historico.length - 1] : null

  return (
    <div className="min-h-screen bg-[#FDFCF0] p-4 md:p-8 text-[#333333]">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#C5A059]/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#001F3F] p-2 rounded-full">
              <UserCircle className="h-6 w-6 text-[#C5A059]" />
            </div>
            <h1 className="text-2xl font-bold text-[#001F3F]">
              Bem-vindo(a), {patient.nome_completo}!
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-[#333333] border-[#333333] hover:bg-[#333333] hover:text-[#FDFCF0]"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-[#C5A059] bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#333333] uppercase tracking-wider">
                Próximas Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#001F3F]">{futuras.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Sessões agendadas</p>
            </CardContent>
          </Card>
          <Card className="border-[#C5A059] bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#333333] uppercase tracking-wider">
                Última Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#001F3F]">
                {ultimaConsulta
                  ? new Date(ultimaConsulta.data).toLocaleDateString('pt-BR')
                  : '--/--/----'}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {ultimaConsulta ? ultimaConsulta.tipo_consulta : 'Nenhum histórico'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#C5A059] bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#333333] uppercase tracking-wider">
                Status do Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#C5A059] flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" /> Ativo
              </div>
              <p className="text-xs text-muted-foreground mt-1">Acompanhamento em dia</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="proximas" className="w-full">
          <TabsList className="mb-6 bg-white border border-[#C5A059]/20 p-1">
            <TabsTrigger
              value="proximas"
              className="data-[state=active]:bg-[#001F3F] data-[state=active]:text-[#FDFCF0]"
            >
              Próximas Sessões
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="data-[state=active]:bg-[#001F3F] data-[state=active]:text-[#FDFCF0]"
            >
              Histórico de Sessões
            </TabsTrigger>
            <TabsTrigger
              value="dados"
              className="data-[state=active]:bg-[#001F3F] data-[state=active]:text-[#FDFCF0]"
            >
              Meus Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proximas" className="space-y-4">
            {futuras.length > 0 ? (
              futuras.map((s) => (
                <Card
                  key={s.id}
                  className="border-[#C5A059]/50 hover:border-[#C5A059] transition-colors"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-semibold text-lg text-[#001F3F]">{s.tipo_consulta}</p>
                      <div className="flex items-center text-sm text-[#333333] gap-4 mt-2">
                        <span className="flex items-center gap-1 bg-[#FDFCF0] px-2 py-1 rounded">
                          <Calendar className="h-4 w-4 text-[#C5A059]" />{' '}
                          {new Date(s.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1 bg-[#FDFCF0] px-2 py-1 rounded">
                          <Clock className="h-4 w-4 text-[#C5A059]" /> {s.horario}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status: {s.status || 'Agendada'}
                      </span>
                      {s.status !== 'Confirmado' && (
                        <Button
                          onClick={() => handleConfirmPresence(s.id)}
                          className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#A88640] text-[#FDFCF0]"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar Presença
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center bg-white border border-dashed border-[#C5A059]/50 rounded-xl py-12">
                <Info className="h-10 w-10 mx-auto mb-3 text-[#C5A059]/50" />
                <p className="text-[#333333] font-medium">Nenhuma sessão agendada.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seu próximo passo aparecerá aqui.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            {historico.length > 0 ? (
              historico.map((s) => (
                <Card key={s.id} className="bg-white/60 border-transparent shadow-sm">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#333333]">{s.tipo_consulta}</p>
                      <div className="flex items-center text-sm text-muted-foreground gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{' '}
                          {new Date(s.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                      Concluída
                    </span>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum histórico encontrado.
              </div>
            )}
          </TabsContent>

          <TabsContent value="dados" className="space-y-4">
            {anamneses.length > 0 ? (
              anamneses.map((a) => (
                <Card key={a.anamnese_id} className="border-[#C5A059]/20">
                  <CardHeader className="bg-[#001F3F] text-white rounded-t-lg pb-3">
                    <CardTitle className="text-[#C5A059] flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Anamnese e Ficha Clínica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 bg-white">
                    <p className="text-sm text-[#333333] mb-4">
                      Seus dados de saúde estão armazenados com segurança.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(a.respostas || {})
                        .filter(([k, v]) => v && typeof v === 'string' && !k.startsWith('sec_'))
                        .slice(0, 10)
                        .map(([k, v]) => (
                          <div key={k} className="border-b border-gray-100 pb-2">
                            <span className="text-xs text-muted-foreground uppercase">
                              {k.replace(/_/g, ' ')}
                            </span>
                            <p className="font-medium text-[#333333] truncate">{String(v)}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Ficha clínica não disponível.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
