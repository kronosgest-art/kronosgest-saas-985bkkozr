import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, User, Trash2, CalendarCheck, Info } from 'lucide-react'
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
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'

export default function SessionsList() {
  const [sessoes, setSessoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
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
      .order('data', { ascending: true })
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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

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
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessoes.map((s) => (
          <Card key={s.id} className="shadow-sm border-l-4 border-l-[#001F3F] relative">
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setRescheduleData({ id: s.id, date: new Date(s.data), time: s.horario })
                }
                className="text-[#C5A059] hover:bg-[#FDFCF0] h-8 w-8"
              >
                <CalendarCheck className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSessionToDelete(s.id)}
                className="text-[#C5A059] hover:bg-[#FDFCF0] h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader className="pb-2 pr-20">
              <CardTitle className="text-lg flex items-center gap-2 text-[#333333]">
                <User className="h-4 w-4 text-muted-foreground" />
                {s.pacientes?.nome_completo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 mt-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" /> Data:{' '}
                {new Date(s.data).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" /> Horário: {s.horario}
              </div>
              <Badge variant="secondary" className="mt-2">
                {s.tipo_consulta}
              </Badge>
            </CardContent>
          </Card>
        ))}
        {sessoes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <Info className="h-10 w-10 mb-2 opacity-50" />
            <p className="mb-4">Nenhum registro encontrado</p>
            <Button
              variant="outline"
              className="text-[#C5A059] border-[#C5A059] hover:bg-[#FDFCF0]"
            >
              <CalendarCheck className="mr-2 h-4 w-4" /> Criar Novo
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(o) => !o && setSessionToDelete(null)}>
        <AlertDialogContent className="bg-[#333333] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C5A059]">Excluir Sessão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza que deseja excluir esta sessão?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-gray-300 hover:bg-gray-800 border-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!rescheduleData} onOpenChange={(o) => !o && setRescheduleData(null)}>
        <DialogContent className="bg-[#333333] text-white border-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#C5A059]">Reagendar Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 flex flex-col items-center">
            <Calendar
              mode="single"
              selected={rescheduleData?.date}
              onSelect={(d) => setRescheduleData((prev) => (prev ? { ...prev, date: d } : null))}
              className="bg-white text-black rounded-md"
            />
            <Input
              type="time"
              value={rescheduleData?.time || ''}
              onChange={(e) =>
                setRescheduleData((prev) => (prev ? { ...prev, time: e.target.value } : null))
              }
              className="bg-white text-black border-[#C5A059]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRescheduleData(null)}
              className="text-gray-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReschedule}
              className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
