import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Trash2,
  CalendarCheck,
  Info,
  MapPin,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { format, isSameDay, parseISO } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { CreateSessionDialog } from './CreateSessionDialog'
import { Label } from '@/components/ui/label'

export default function SessionsList() {
  const [sessoes, setSessoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [rescheduleData, setRescheduleData] = useState<{
    id: string
    date: Date | undefined
    time: string
  } | null>(null)

  const loadSessoes = async () => {
    setLoading(true)
    setError(false)
    const { data, error: err } = await supabase
      .from('agendamentos')
      .select('*, pacientes(nome_completo)')
      .order('horario', { ascending: true })
    if (err) {
      setError(true)
    } else if (data) {
      setSessoes(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSessoes()
  }, [])

  const handleDelete = async () => {
    if (!sessionToDelete) return
    const { error } = await supabase.from('agendamentos').delete().eq('id', sessionToDelete)
    if (error) toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Sessão excluída com sucesso.' })
      setSessionToDelete(null)
      loadSessoes()
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleData?.id || !rescheduleData.date || !rescheduleData.time) return
    const dateStr = format(rescheduleData.date, 'yyyy-MM-dd')
    const { error } = await supabase
      .from('agendamentos')
      .update({ data: dateStr, horario: rescheduleData.time })
      .eq('id', rescheduleData.id)
    if (error) toast({ title: 'Erro', description: 'Erro ao reagendar.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Sessão reagendada com sucesso.' })
      setRescheduleData(null)
      loadSessoes()
    }
  }

  const filteredSessoes = selectedDate
    ? sessoes.filter((s) => isSameDay(parseISO(s.data), selectedDate))
    : sessoes

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-500 mb-4 font-medium">Erro ao carregar as sessões.</p>
        <Button onClick={loadSessoes} className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F] tracking-tight">Sessões Agendadas</h1>
          <p className="text-muted-foreground mt-1">Gerencie a agenda e sessões de atendimento.</p>
        </div>
        <CreateSessionDialog onCreated={loadSessoes} defaultDate={selectedDate} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-[350px] shrink-0">
          <Card className="shadow-sm border-[#001F3F]/10 sticky top-24 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#001F3F]">Calendário de Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full flex justify-center bg-white"
                modifiers={{
                  hasSession: sessoes.map((s) => parseISO(s.data)),
                }}
                modifiersStyles={{
                  hasSession: { fontWeight: 'bold', textDecoration: 'underline', color: '#001F3F' },
                }}
              />
              <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-[#001F3F] mr-2" />
                <span className="flex-1">Sincronizado com Google Calendar</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold text-[#001F3F]">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM, yyyy") : 'Todas as Sessões'}
            </h2>
            <Badge variant="outline" className="text-[#C5A059] border-[#C5A059]">
              {filteredSessoes.length}{' '}
              {filteredSessoes.length === 1 ? 'agendamento' : 'agendamentos'}
            </Badge>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSessoes.map((s) => (
                <Card
                  key={s.id}
                  className="shadow-sm border-l-4 border-l-[#001F3F] relative hover:shadow-md transition-shadow"
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setRescheduleData({ id: s.id, date: parseISO(s.data), time: s.horario })
                      }
                      className="text-[#C5A059] hover:bg-[#FDFCF0] h-8 w-8"
                      title="Reagendar"
                    >
                      <CalendarCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSessionToDelete(s.id)}
                      className="text-red-500 hover:bg-red-50 h-8 w-8"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader className="pb-2 pr-20">
                    <CardTitle className="text-lg flex items-center gap-2 text-[#333333]">
                      <User className="h-4 w-4 text-[#001F3F]" />
                      <span className="truncate">
                        {s.pacientes?.nome_completo || 'Paciente não encontrado'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 mt-2">
                    <div className="flex items-center text-sm font-medium text-[#001F3F]">
                      <Clock className="mr-2 h-4 w-4 text-[#C5A059]" /> {s.horario}
                    </div>
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-[#FDFCF0] text-[#C5A059] border border-[#C5A059]/20"
                    >
                      {s.tipo_consulta}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              {filteredSessoes.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white">
                  <CalendarIcon className="h-12 w-12 mb-4 text-[#001F3F]/20" />
                  <p className="mb-4 text-[#001F3F]/60">Nenhuma sessão agendada para esta data.</p>
                  <CreateSessionDialog onCreated={loadSessoes} defaultDate={selectedDate} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(o) => !o && setSessionToDelete(null)}>
        <AlertDialogContent className="bg-white border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#001F3F]">Excluir Sessão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!rescheduleData} onOpenChange={(o) => !o && setRescheduleData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#001F3F]">Reagendar Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 flex flex-col items-center">
            <Calendar
              mode="single"
              selected={rescheduleData?.date}
              onSelect={(d) => setRescheduleData((prev) => (prev ? { ...prev, date: d } : null))}
              className="bg-white rounded-md border"
            />
            <div className="w-full space-y-2">
              <Label>Novo Horário</Label>
              <Input
                type="time"
                value={rescheduleData?.time || ''}
                onChange={(e) =>
                  setRescheduleData((prev) => (prev ? { ...prev, time: e.target.value } : null))
                }
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleData(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReschedule}
              className="bg-[#001F3F] text-white hover:bg-[#00152B]"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
