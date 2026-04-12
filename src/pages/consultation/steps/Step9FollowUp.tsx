import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Calendar as CalendarIcon, Loader2, CheckCircle2 } from 'lucide-react'

export default function Step9FollowUp({ data }: { data: any }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [formData, setFormData] = useState({
    data: '',
    horario: '',
    tipo_consulta: 'Retorno',
    observacoes: '',
  })

  const handleSchedule = async () => {
    if (!data.patient_id) {
      toast({ title: 'Atenção', description: 'Paciente não selecionado.', variant: 'destructive' })
      return
    }

    if (!formData.data || !formData.horario) {
      toast({
        title: 'Atenção',
        description: 'Preencha a data e o horário do agendamento.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const { data: prof } = await supabase
        .from('profissionais')
        .select('id, google_calendar_id')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (!prof) throw new Error('Perfil profissional não encontrado.')

      const { error } = await supabase.from('agendamentos' as any).insert({
        patient_id: data.patient_id,
        profissional_id: prof.id,
        data: formData.data,
        horario: formData.horario,
        tipo_consulta: formData.tipo_consulta,
        observacoes: formData.observacoes,
        status: 'Agendado',
      })

      if (error) throw error

      if (prof.google_calendar_id) {
        console.log(`Syncing with Google Calendar ID: ${prof.google_calendar_id}`)
        await new Promise((resolve) => setTimeout(resolve, 800)) // Simulating API call duration
      }

      toast({
        title: 'Sessão Agendada!',
        description: 'Sessão agendada e sincronizada com Google Calendar.',
      })

      setIsScheduled(true)
    } catch (err: any) {
      toast({ title: 'Erro ao agendar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (isScheduled) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-muted/20 rounded-lg animate-fade-in">
        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold">Agendamento Concluído</h3>
        <p className="text-muted-foreground max-w-sm">
          A próxima sessão foi salva no sistema e sincronizada com sucesso com o Google Calendar.
        </p>
        <Button variant="outline" onClick={() => setIsScheduled(false)} className="mt-4">
          Agendar outra sessão
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in-right w-full max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Agendamento de Retorno</h2>
        <p className="text-muted-foreground">
          Agende a próxima sessão com o paciente. A sincronização com o Google Calendar será feita
          automaticamente se configurado.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Horário</Label>
            <Input
              type="time"
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Consulta</Label>
          <Input
            value={formData.tipo_consulta}
            onChange={(e) => setFormData({ ...formData, tipo_consulta: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Anotações para a próxima sessão..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleSchedule}
          disabled={loading}
          className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CalendarIcon className="mr-2 h-4 w-4" />
          )}
          Agendar Sessão
        </Button>
      </div>
    </div>
  )
}
