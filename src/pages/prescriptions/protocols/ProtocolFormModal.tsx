import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Protocol } from './use-protocols'

interface ProtocolFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (protocol: Protocol) => Promise<void>
  initialData?: Protocol | null
}

const DEFAULT_STATE: Protocol = {
  nome: '',
  tipo: '',
  duracao: '',
  descricao: '',
  suplementos: '',
  contraindicacoes: '',
  is_padrao: false,
}

export default function ProtocolFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ProtocolFormModalProps) {
  const [formData, setFormData] = useState<Protocol>(DEFAULT_STATE)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || DEFAULT_STATE)
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Editar Protocolo' : 'Novo Protocolo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Nome do Protocolo *</Label>
              <Input
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Detox Premium"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(val) => setFormData({ ...formData, tipo: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Limpeza do Terreno">Limpeza do Terreno</SelectItem>
                  <SelectItem value="Desparasitação">Desparasitação</SelectItem>
                  <SelectItem value="Detox">Detox</SelectItem>
                  <SelectItem value="Suplementação">Suplementação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duração</Label>
              <Select
                value={formData.duracao}
                onValueChange={(val) => setFormData({ ...formData, duracao: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7 dias">7 dias</SelectItem>
                  <SelectItem value="14 dias">14 dias</SelectItem>
                  <SelectItem value="21 dias">21 dias</SelectItem>
                  <SelectItem value="30 dias">30 dias</SelectItem>
                  <SelectItem value="Contínuo">Uso Contínuo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Objetivo / Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o objetivo clínico..."
            />
          </div>

          <div className="space-y-2">
            <Label>Fórmula / Suplementos (com dosagem) *</Label>
            <Textarea
              required
              className="min-h-[150px] font-mono"
              value={formData.suplementos}
              onChange={(e) => setFormData({ ...formData, suplementos: e.target.value })}
              placeholder="1. Ativo X - 500mg - 1 cápsula ao dia..."
            />
          </div>

          <div className="space-y-2">
            <Label>Contraindicações / Alertas</Label>
            <Textarea
              value={formData.contraindicacoes}
              onChange={(e) => setFormData({ ...formData, contraindicacoes: e.target.value })}
              placeholder="Ex: Não recomendado para gestantes..."
            />
          </div>

          <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label>Salvar como Protocolo Padrão</Label>
              <p className="text-xs text-muted-foreground">
                Protocolos padrão aparecem para todos os membros da clínica.
              </p>
            </div>
            <Switch
              checked={formData.is_padrao}
              onCheckedChange={(checked) => setFormData({ ...formData, is_padrao: checked })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              Salvar Protocolo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
