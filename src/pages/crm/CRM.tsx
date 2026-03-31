import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sparkles,
  MessageCircle,
  MoreVertical,
  Plus,
  Loader2,
  Trash2,
  Phone,
  Mail,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

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

export default function CRM() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<any>(null)

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Form states
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newMsg, setNewMsg] = useState('')
  const [newSource, setNewSource] = useState('WhatsApp')

  useEffect(() => {
    if (user) {
      fetchLeads()
    }
  }, [user])

  const fetchLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({ title: 'Erro ao carregar leads', description: error.message, variant: 'destructive' })
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  const handleAddLead = async () => {
    if (!newName.trim()) {
      toast({
        title: 'Atenção',
        description: 'O nome do lead é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setIsAdding(true)
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          user_id: user?.id,
          name: newName,
          phone: newPhone,
          email: newEmail,
          msg: newMsg,
          source: newSource,
          status: 'novo',
        },
      ])
      .select()
      .single()

    setIsAdding(false)

    if (error) {
      toast({ title: 'Erro ao adicionar lead', description: error.message, variant: 'destructive' })
    } else if (data) {
      setLeads([data, ...leads])
      setIsAddOpen(false)
      setNewName('')
      setNewPhone('')
      setNewEmail('')
      setNewMsg('')
      setNewSource('WhatsApp')
      toast({ title: 'Sucesso', description: 'Lead adicionado com sucesso.' })
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Atualização otimista
    const previousLeads = [...leads]
    setLeads(leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l)))

    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id)

    if (error) {
      setLeads(previousLeads) // Reverte se falhar
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Status atualizado' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return

    const { error } = await supabase.from('leads').delete().eq('id', id)

    if (error) {
      toast({ title: 'Erro ao excluir lead', description: error.message, variant: 'destructive' })
    } else {
      setLeads(leads.filter((l) => l.id !== id))
      toast({ title: 'Lead excluído permanentemente' })
    }
  }

  const handleSendResponse = async () => {
    if (!selectedLead) return
    setIsUpdating(true)
    await handleUpdateStatus(selectedLead.id, 'contato')
    setIsUpdating(false)
    setSelectedLead(null)
  }

  // Funções de Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessário para permitir o drop
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('leadId')
    if (id) {
      const lead = leads.find((l) => l.id === id)
      if (lead && lead.status !== newStatus) {
        handleUpdateStatus(id, newStatus)
      }
    }
  }

  const iaResponse = `Olá, ${selectedLead?.name}! Tudo bem? Recebemos seu contato. Como podemos ajudar hoje?`

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col animate-fade-in-up">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM & Leads</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie prospecções de forma persistente e integrada.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right hidden sm:block mr-4">
            <p className="text-sm text-muted-foreground">Total de Leads</p>
            <p className="text-xl font-bold text-primary">{leads.length}</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Lead
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 overflow-hidden">
          {columns.map((col) => (
            <div
              key={col.id}
              className={`flex flex-col rounded-xl border ${col.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-3 font-semibold border-b border-inherit flex justify-between items-center">
                {col.title}
                <Badge variant="secondary" className="bg-background">
                  {leads.filter((l) => l.status === col.id).length}
                </Badge>
              </div>
              <div className="p-2 flex-1 overflow-y-auto space-y-2">
                {leads
                  .filter((l) => l.status === col.id)
                  .map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="cursor-pointer hover:shadow-md transition-all group relative active:cursor-grabbing"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm pr-6">{lead.name}</span>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(lead.id, 'novo')}
                                >
                                  Mover para Novo Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(lead.id, 'contato')}
                                >
                                  Mover para Contato
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(lead.id, 'agendado')}
                                >
                                  Mover para Agendado
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(lead.id, 'convertido')}
                                >
                                  Mover para Convertido
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                  onClick={() => handleDelete(lead.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {(lead.phone || lead.email) && (
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-2">
                            {lead.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {lead.phone}
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {lead.email}
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {lead.msg || 'Sem mensagem'}
                        </p>
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
      )}

      {/* Dialog: Responder Lead */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Responder Lead: {selectedLead?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg text-sm italic">
              "{selectedLead?.msg || 'Sem mensagem'}"
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-secondary">
                <Sparkles className="h-4 w-4" /> Sugestão de Resposta (IA)
              </label>
              <Textarea defaultValue={iaResponse} rows={5} className="resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button className="gap-2" onClick={handleSendResponse} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              Enviar e Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adicionar Lead */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Lead</Label>
              <Input
                id="name"
                placeholder="Ex: Maria Silva"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <Input
                id="source"
                placeholder="Ex: WhatsApp, Instagram, Site"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg">Mensagem Inicial</Label>
              <Textarea
                id="msg"
                placeholder="Ex: Gostaria de saber o valor da consulta."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isAdding}>
              Cancelar
            </Button>
            <Button onClick={handleAddLead} disabled={isAdding}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
