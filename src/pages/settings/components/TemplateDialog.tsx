import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash, Plus, ArrowUp, ArrowDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { AnamneseTemplate, AnamneseQuestion } from '../AnamneseTemplates'

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: AnamneseTemplate | null
  onSave: () => void
}

export default function TemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [nome, setNome] = useState('')
  const [perguntas, setPerguntas] = useState<AnamneseQuestion[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (template) {
        setNome(template.nome_template)
        setPerguntas(template.perguntas || [])
      } else {
        setNome('')
        setPerguntas([{ id: crypto.randomUUID(), titulo: '', tipo: 'text', obrigatoria: false }])
      }
    }
  }, [open, template])

  const addPergunta = () => {
    setPerguntas([
      ...perguntas,
      { id: crypto.randomUUID(), titulo: '', tipo: 'text', obrigatoria: false },
    ])
  }

  const updatePergunta = (index: number, updates: Partial<AnamneseQuestion>) => {
    const newPerguntas = [...perguntas]
    newPerguntas[index] = { ...newPerguntas[index], ...updates }
    setPerguntas(newPerguntas)
  }

  const removePergunta = (index: number) => {
    const newPerguntas = [...perguntas]
    newPerguntas.splice(index, 1)
    setPerguntas(newPerguntas)
  }

  const movePergunta = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === perguntas.length - 1) return

    const newPerguntas = [...perguntas]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newPerguntas[index]
    newPerguntas[index] = newPerguntas[swapIndex]
    newPerguntas[swapIndex] = temp
    setPerguntas(newPerguntas)
  }

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({
        title: 'Atenção',
        description: 'O nome do modelo é obrigatório.',
        variant: 'destructive',
      })
      return
    }
    if (perguntas.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Adicione pelo menos uma pergunta.',
        variant: 'destructive',
      })
      return
    }
    if (perguntas.some((p) => !p.titulo.trim())) {
      toast({
        title: 'Atenção',
        description: 'Todas as perguntas devem ter um título.',
        variant: 'destructive',
      })
      return
    }

    if (!user) return
    setSaving(true)

    const payload = {
      profissional_id: user.id,
      nome_template: nome,
      perguntas,
      atualizado_em: new Date().toISOString(),
    }

    let error
    if (template) {
      const res = await supabase
        .from('anamnese_templates' as any)
        .update(payload)
        .eq('template_id', template.template_id)
      error = res.error
    } else {
      const res = await supabase
        .from('anamnese_templates' as any)
        .insert({ ...payload, eh_padrao: false })
      error = res.error
    }

    setSaving(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Modelo salvo com sucesso.' })
      onSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{template ? 'Editar Modelo' : 'Criar Novo Modelo'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          <div className="space-y-2">
            <Label>Nome do Modelo</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Anamnese Completa"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-[#1E3A8A]">
                Perguntas ({perguntas.length})
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addPergunta}
                className="border-[#1E3A8A] text-[#1E3A8A]"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>

            {perguntas.map((p, index) => (
              <div
                key={p.id}
                className="p-4 border rounded-md bg-muted/20 space-y-4 relative group"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Título da Pergunta</Label>
                    <Input
                      value={p.titulo}
                      onChange={(e) => updatePergunta(index, { titulo: e.target.value })}
                      placeholder="Qual sua queixa principal?"
                    />
                  </div>
                  <div className="w-full sm:w-48 space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={p.tipo}
                      onValueChange={(val: any) => updatePergunta(index, { tipo: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto Livre</SelectItem>
                        <SelectItem value="checkbox">Caixa de Seleção</SelectItem>
                        <SelectItem value="select">Múltipla Escolha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {p.tipo === 'select' && (
                  <div className="space-y-2 animate-fade-in">
                    <Label>Opções (separadas por vírgula)</Label>
                    <Input
                      value={p.opcoes?.join(', ') || ''}
                      onChange={(e) =>
                        updatePergunta(index, {
                          opcoes: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Sim, Não, Talvez"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={p.obrigatoria}
                      onCheckedChange={(checked) => updatePergunta(index, { obrigatoria: checked })}
                      id={`req-${p.id}`}
                    />
                    <Label htmlFor={`req-${p.id}`} className="cursor-pointer">
                      Obrigatória
                    </Label>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => movePergunta(index, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === perguntas.length - 1}
                      onClick={() => movePergunta(index, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removePergunta(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
          >
            {saving ? 'Salvando...' : 'Salvar Modelo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
