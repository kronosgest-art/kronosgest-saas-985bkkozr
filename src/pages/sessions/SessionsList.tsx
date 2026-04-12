import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, User, CheckCircle2, XCircle, Clock3, Edit2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function SessionsList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSession, setEditingSession] = useState<any>(null)

  useEffect(() => {
    if (user) loadSessions()
  }, [user])

  const loadSessions = async () => {
    try {
      const { data: prof } = await supabase
        .from('profissionais')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (prof) {
        const { data, error } = await supabase
          .from('agendamentos' as any)
          .select(`
            *,
            pacientes (
              nome_completo
            )
          `)
          .eq('profissional_id', prof.id)
          .order('data', { ascending: true })
          .order('horario', { ascending: true })

        if (error) throw error
        setSessions(data || [])
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro ao carregar sessões',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingSession) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('agendamentos' as any)
        .update({
          data: editingSession.data,
          horario: editingSession.horario,
          status: editingSession.status,
        })
        .eq('id', editingSession.id)

      if (error) throw error

      toast({ title: 'Sessão atualizada com sucesso!' })
      setEditingSession(null)
      loadSessions()
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Realizado':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Realizado
          </Badge>
        )
      case 'Cancelado':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Cancelado
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Clock3 className="w-3 h-3 mr-1" /> Agendado
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Gestão de Sessões</h1>
        <p className="text-muted-foreground">Acompanhe e gerencie todos os seus agendamentos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <Card className="col-span-full py-16 border-dashed shadow-none bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center text-center p-0">
              <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhuma sessão agendada.</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.id}
              className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary leading-tight">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">
                      {session.pacientes?.nome_completo || 'Paciente Desconhecido'}
                    </span>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {session.data
                      ? format(parseISO(session.data), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {session.horario || '-'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex justify-between items-center border-t mt-4 pt-4 bg-muted/5">
                <div>{getStatusBadge(session.status || 'Agendado')}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSession(session)}
                  className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Editar
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Sessão</DialogTitle>
          </DialogHeader>
          {editingSession && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Input
                  value={editingSession.pacientes?.nome_completo || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={editingSession.data}
                    onChange={(e) => setEditingSession({ ...editingSession, data: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={editingSession.horario}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, horario: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingSession.status || 'Agendado'}
                  onValueChange={(v) => setEditingSession({ ...editingSession, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agendado">Agendado</SelectItem>
                    <SelectItem value="Realizado">Realizado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSession(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
