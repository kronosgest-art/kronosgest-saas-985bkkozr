import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface Step9FollowUpProps {
  data?: any
}

export default function Step9FollowUp({ data }: Step9FollowUpProps) {
  const [date, setDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 35)),
  )
  const [time, setTime] = useState('')
  const [type, setType] = useState('Presencial')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSchedule = async () => {
    if (!data?.patient_id) {
      toast({ title: 'Erro', description: 'Paciente não identificado.', variant: 'destructive' })
      return
    }
    if (!date || !time) {
      toast({
        title: 'Erro de Validação',
        description: 'Selecione a data e o horário.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.from('agendamentos').insert({
        patient_id: data.patient_id,
        data: date.toISOString().split('T')[0],
        horario: time,
        tipo_consulta: type,
        observacoes: notes,
      })

      if (error) throw error

      setIsSuccess(true)
      toast({
        title: `✓ Próxima consulta agendada para ${date.toLocaleDateString('pt-BR')} às ${time}.`,
      })
    } catch (err: any) {
      toast({ title: 'Erro ao agendar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6 animate-in zoom-in fade-in">
        <CheckCircle2 className="w-20 h-20 text-green-500" />
        <h2 className="text-3xl font-bold text-primary">Consulta Finalizada</h2>
        <p className="text-lg text-muted-foreground text-center">
          O agendamento para {date?.toLocaleDateString('pt-BR')} às {time} foi registrado com
          sucesso.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Agendamento de Retorno</h2>
        <p className="text-muted-foreground">
          Agende a próxima consulta do paciente para acompanhamento.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Data da próxima consulta</Label>
            <Card className="p-4 inline-block shadow-sm">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Horário</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full max-w-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Consulta</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full max-w-[200px]">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Presencial">Presencial</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Híbrida">Híbrida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações (Opcional)</Label>
            <Textarea
              placeholder="Ex: Trazer novos exames solicitados..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg mt-4"
            onClick={handleSchedule}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            Agendar Próxima Consulta
          </Button>
        </div>
      </div>
    </div>
  )
}
