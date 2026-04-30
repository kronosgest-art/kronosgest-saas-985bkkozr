import { useState, useEffect } from 'react'
import { Lead, Column } from '../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string | null
  leads: Lead[]
  columns: Column[]
  prefilledColumnId?: string
  onSave: (id: string | null, data: Omit<Lead, 'id' | 'createdAt'>) => void
}

export function LeadDialog({
  open,
  onOpenChange,
  leadId,
  leads,
  columns,
  prefilledColumnId,
  onSave,
}: LeadDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [columnId, setColumnId] = useState<string>('none')
  const [status, setStatus] = useState('Novo')

  useEffect(() => {
    if (open) {
      if (leadId) {
        const lead = leads.find((l) => l.id === leadId)
        setName(lead?.name || '')
        setEmail(lead?.email || '')
        setPhone(lead?.phone || '')
        setColumnId(lead?.columnId || 'none')
        setStatus(lead?.status || 'Novo')
      } else {
        setName('')
        setEmail('')
        setPhone('')
        setColumnId(prefilledColumnId || 'none')
        setStatus('Novo')
      }
    }
  }, [open, leadId, leads, prefilledColumnId])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(leadId, { name, email, phone, columnId: columnId === 'none' ? null : columnId, status })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{leadId ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João da Silva"
              className="focus-visible:ring-[#C5A059]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                className="focus-visible:ring-[#C5A059]"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="focus-visible:ring-[#C5A059]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Coluna / Etiqueta</Label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger className="focus:ring-[#C5A059]">
                  <SelectValue placeholder="Sem coluna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem etiqueta</SelectItem>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="Ex: Ativo, Pendente"
                className="focus-visible:ring-[#C5A059]"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
