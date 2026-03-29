import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, MessageCircle, MoreVertical } from 'lucide-react'

const columns = [
  { id: 'novo', title: 'Novo Lead', color: 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/20' },
  {
    id: 'contato',
    title: 'Em Contato',
    color: 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/20',
  },
  {
    id: 'agendado',
    title: 'Agendado',
    color: 'border-purple-200 bg-purple-50/50 dark:bg-purple-900/20',
  },
  {
    id: 'convertido',
    title: 'Convertido',
    color: 'border-green-200 bg-green-50/50 dark:bg-green-900/20',
  },
]

const mockLeads = [
  {
    id: 1,
    name: 'Pedro Alves',
    status: 'novo',
    msg: 'Gostaria de saber sobre limpeza hepática.',
    source: 'Instagram',
  },
  {
    id: 2,
    name: 'Lucia Ferraz',
    status: 'contato',
    msg: 'Qual o valor da consulta?',
    source: 'WhatsApp',
  },
  { id: 3, name: 'Roberto Lima', status: 'agendado', msg: 'Marcado para 15/10', source: 'Site' },
  {
    id: 4,
    name: 'Fernanda Luz',
    status: 'novo',
    msg: 'Vocês tratam enxaqueca?',
    source: 'Facebook',
  },
]

export default function CRM() {
  const [selectedLead, setSelectedLead] = useState<any>(null)

  const iaResponse = `Olá, ${selectedLead?.name}! Tudo bem? A limpeza hepática é um dos nossos protocolos mais procurados. Ela ajuda muito na desintoxicação. Posso te enviar um PDF explicativo e os valores da consulta inicial?`

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col animate-fade-in-up">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM & Leads</h1>
          <p className="text-muted-foreground mt-1">Gerencie prospecções com auxílio de IA.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <p className="text-xl font-bold text-primary">28.5%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tempo Médio</p>
            <p className="text-xl font-bold text-primary">2.4 dias</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 overflow-hidden">
        {columns.map((col) => (
          <div key={col.id} className={`flex flex-col rounded-xl border ${col.color}`}>
            <div className="p-3 font-semibold border-b border-inherit flex justify-between items-center">
              {col.title}
              <Badge variant="secondary" className="bg-background">
                {mockLeads.filter((l) => l.status === col.id).length}
              </Badge>
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-2">
              {mockLeads
                .filter((l) => l.status === col.id)
                .map((lead) => (
                  <Card
                    key={lead.id}
                    className="cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{lead.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{lead.msg}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <Badge variant="outline" className="text-[10px]">
                          {lead.source}
                        </Badge>
                        {col.id === 'novo' && (
                          <div className="flex gap-1 items-center text-[10px] font-medium text-secondary">
                            <Sparkles className="h-3 w-3" /> IA Sugere
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Responder Lead: {selectedLead?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg text-sm italic">"{selectedLead?.msg}"</div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-secondary">
                <Sparkles className="h-4 w-4" /> Sugestão de Resposta (IA)
              </label>
              <Textarea defaultValue={iaResponse} rows={5} className="resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              Cancelar
            </Button>
            <Button className="gap-2">
              <MessageCircle className="h-4 w-4" /> Enviar (WhatsApp)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
