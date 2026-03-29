import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PenTool } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function Step9FollowUp() {
  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Acompanhamento e Assinatura</h2>
        <p className="text-muted-foreground">
          Agende o retorno e colha a assinatura digital do paciente.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Data Sugerida para Retorno (35 dias)</Label>
            <Card className="p-4 inline-block">
              <Calendar
                mode="single"
                selected={new Date(new Date().setDate(new Date().getDate() + 35))}
                className="rounded-md border"
              />
            </Card>
          </div>
          <div className="space-y-2">
            <Label>Evolução Clínica (Interno)</Label>
            <Textarea placeholder="Paciente respondeu bem à primeira etapa..." rows={4} />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Assinatura Digital do Paciente</Label>
          <div className="border-2 border-dashed border-border rounded-xl h-[200px] bg-muted/20 relative flex items-center justify-center cursor-crosshair">
            <span className="text-muted-foreground opacity-50 flex items-center gap-2 select-none">
              <PenTool className="h-5 w-5" /> Assine aqui
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              Limpar Assinatura
            </Button>
            <Button variant="secondary" size="sm">
              Salvar Assinatura
            </Button>
          </div>

          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2 text-sm text-primary">Notificações Automáticas</h4>
            <p className="text-xs text-muted-foreground">
              Um lembrete via WhatsApp e E-mail será agendado automaticamente 3 dias antes da data
              selecionada acima.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
