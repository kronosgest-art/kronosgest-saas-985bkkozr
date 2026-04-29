import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export function CreateSessionDialog({
  onCreated,
  defaultDate,
}: {
  onCreated: () => void
  defaultDate?: Date
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [formData, setFormData] = useState({
    patient_id: '',
    data: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    horario: '09:00',
    tipo_consulta: 'Primeira Consulta',
  })

  useEffect(() => {
    if (open) {
      supabase
        .from('pacientes')
        .select('id, nome_completo')
        .order('nome_completo')
        .then(({ data }) => {
          if (data) setPacientes(data)
        })
      if (defaultDate) {
        setFormData((p) => ({ ...p, data: format(defaultDate, 'yyyy-MM-dd') }))
      }
    }
  }, [open, defaultDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patient_id) {
      toast({ title: 'Erro', description: 'Selecione um paciente', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      let profId = null
      if (session?.user?.id) {
        const { data: prof } = await supabase
          .from('profissionais')
          .select('id')
          .eq('user_id', session.user.id)
          .single()
        profId = prof?.id
      }

      const { error } = await supabase.from('agendamentos').insert({
        patient_id: formData.patient_id,
        data: formData.data,
        horario: formData.horario,
        tipo_consulta: formData.tipo_consulta,
        profissional_id: profId,
        status: 'Agendado',
      })

      if (error) throw error

      if (profId) {
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-to-google-calendar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ profissional_id: profId }),
        }).catch((err) => console.error('Sync error:', err))
      }

      toast({
        title: 'Sucesso',
        description: 'Sessão agendada com sucesso. Integrada ao Google Calendar.',
      })
      setOpen(false)
      onCreated()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#001F3F] hover:bg-[#00152B] text-white">
          <CalendarCheck className="mr-2 h-4 w-4" /> Nova Sessão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Nova Sessão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={(v) => setFormData((p) => ({ ...p, patient_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData((p) => ({ ...p, data: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário *</Label>
              <Input
                type="time"
                required
                value={formData.horario}
                onChange={(e) => setFormData((p) => ({ ...p, horario: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Consulta *</Label>
            <Select
              value={formData.tipo_consulta}
              onValueChange={(v) => setFormData((p) => ({ ...p, tipo_consulta: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primeira Consulta">Primeira Consulta</SelectItem>
                <SelectItem value="Retorno">Retorno</SelectItem>
                <SelectItem value="Sessão Protocolo">Sessão de Protocolo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#C5A059] hover:bg-[#A88640] text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmar Agendamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
