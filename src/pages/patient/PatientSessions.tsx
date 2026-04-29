import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PatientSessions() {
  const { user } = useAuth()
  const [sessoes, setSessoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data: patient } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (patient) {
        const { data } = await supabase
          .from('agendamentos')
          .select('*')
          .eq('patient_id', patient.id)
          .order('data', { ascending: true })
        if (data) setSessoes(data)
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Minhas Sessões Agendadas</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessoes.map((s) => (
          <Card key={s.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" /> {s.tipo_consulta}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Data:</strong> {new Date(s.data).toLocaleDateString('pt-BR')} às {s.horario}
              </p>
              <Badge variant={s.status === 'Agendado' ? 'default' : 'secondary'}>
                {s.status || 'Agendado'}
              </Badge>
            </CardContent>
          </Card>
        ))}
        {sessoes.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhuma sessão agendada.
          </div>
        )}
      </div>
    </div>
  )
}
