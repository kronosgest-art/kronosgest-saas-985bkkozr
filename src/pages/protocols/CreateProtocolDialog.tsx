import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export function CreateProtocolDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    duracao: '',
    valor_total: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const { error } = await supabase.from('protocolos').insert({
        nome: formData.nome,
        tipo: formData.tipo,
        duracao: formData.duracao,
        valor_total: formData.valor_total ? parseFloat(formData.valor_total) : null,
        user_id: session?.user?.id,
      })

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Protocolo criado com sucesso.' })
      setOpen(false)
      setFormData({ nome: '', tipo: '', duracao: '', valor_total: '' })
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
        <Button variant="outline" className="text-[#333333] hover:border-[#C5A059]">
          <Plus className="mr-2 h-4 w-4" /> Novo Protocolo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Protocolo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nome do Protocolo *</Label>
            <Input
              required
              value={formData.nome}
              onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo/Categoria</Label>
            <Input
              value={formData.tipo}
              onChange={(e) => setFormData((p) => ({ ...p, tipo: e.target.value }))}
              placeholder="Ex: Estético, Reposição"
            />
          </div>
          <div className="space-y-2">
            <Label>Duração</Label>
            <Input
              value={formData.duracao}
              onChange={(e) => setFormData((p) => ({ ...p, duracao: e.target.value }))}
              placeholder="Ex: 30 dias"
            />
          </div>
          <div className="space-y-2">
            <Label>Valor Total (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.valor_total}
              onChange={(e) => setFormData((p) => ({ ...p, valor_total: e.target.value }))}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#C5A059] hover:bg-[#A88640] text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Protocolo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
