import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, LogOut, FileText, Info } from 'lucide-react'

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
      const [{ data: sData }, { data: aData }] = await Promise.all([
        supabase
          .from('agendamentos')
          .select('*')
          .eq('patient_id', p.id)
          .order('data', { ascending: true }),
        supabase.from('anamnese').select('*').eq('patient_id', p.id),
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

  if (loading)
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    )
  if (!patient) return null

  const now = new Date()
  const futuras = sessoes.filter((s) => new Date(`${s.data}T${s.horario}`) >= now)
  const historico = sessoes.filter((s) => new Date(`${s.data}T${s.horario}`) < now)

  return (
    <div className="min-h-screen bg-[#FDFCF0] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#001F3F]">Olá, {patient.nome_completo}</h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-[#333333] border-[#C5A059] hover:bg-[#C5A059] hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-[#C5A059]">
            <CardHeader className="bg-[#001F3F] text-white rounded-t-lg">
              <CardTitle className="text-[#C5A059]">Próximas Sessões</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {futuras.length > 0 ? (
                futuras.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-semibold text-[#333333]">{s.tipo_consulta}</p>
                      <div className="flex items-center text-sm text-gray-600 gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{' '}
                          {new Date(s.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {s.horario}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhuma sessão agendada.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#C5A059]">
            <CardHeader className="bg-[#001F3F] text-white rounded-t-lg">
              <CardTitle className="text-[#C5A059]">Histórico e Dados</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {anamneses.length > 0 && (
                <div className="p-3 border rounded-md bg-white">
                  <h4 className="font-semibold flex items-center gap-2 text-[#333333]">
                    <FileText className="h-4 w-4 text-[#C5A059]" /> Sua Anamnese
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Dados de saúde preenchidos estão seguros no sistema.
                  </p>
                </div>
              )}
              {historico.length > 0 ? (
                historico.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 border rounded-md bg-gray-50 opacity-80"
                  >
                    <div>
                      <p className="font-semibold text-[#333333]">{s.tipo_consulta}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(s.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-green-600">Realizada</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">Nenhum histórico encontrado.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
