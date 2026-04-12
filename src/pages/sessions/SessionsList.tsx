import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Loader2, Clock, User } from 'lucide-react'

export default function SessionsList() {
  const [sessoes, setSessoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSessoes() {
      const { data } = await supabase
        .from('agendamentos')
        .select('*, pacientes(nome_completo)')
        .order('data', { ascending: true })
      if (data) setSessoes(data)
      setLoading(false)
    }
    loadSessoes()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Sessões Agendadas</h1>
          <p className="text-muted-foreground mt-1">Gerencie a agenda e sessões de atendimento.</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" /> Nova Sessão
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessoes.map((s) => (
          <Card key={s.id} className="shadow-sm border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {s.pacientes?.nome_completo}
                </CardTitle>
                <Badge variant={s.status === 'Realizado' ? 'default' : 'outline'}>{s.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 mt-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" /> Data:{' '}
                {new Date(s.data).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" /> Horário: {s.horario}
              </div>
              <div className="pt-2">
                <Badge variant="secondary" className="w-full justify-center rounded-sm">
                  {s.tipo_consulta}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {sessoes.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhuma sessão agendada no momento.
          </div>
        )}
      </div>
    </div>
  )
}
