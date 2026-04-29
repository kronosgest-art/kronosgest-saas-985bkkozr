import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export function CreatePrescriptionDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [formData, setFormData] = useState({
    patient_id: '',
    prescricao: '',
    posologia: '',
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
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patient_id) {
      toast({ title: 'Erro', description: 'Selecione um paciente', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const conteudo_json = {
        prescricao: formData.prescricao,
        posologia: formData.posologia,
        avisos: [],
      }

      const { error } = await supabase.from('prescricoes').insert({
        patient_id: formData.patient_id,
        conteudo_json,
      })

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Prescrição criada com sucesso.' })
      setOpen(false)
      setFormData({ patient_id: '', prescricao: '', posologia: '' })
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
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Nova Prescrição
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Prescrição Manual</DialogTitle>
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
          <div className="space-y-2">
            <Label>Fórmula/Medicação *</Label>
            <Textarea
              required
              value={formData.prescricao}
              onChange={(e) => setFormData((p) => ({ ...p, prescricao: e.target.value }))}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Posologia *</Label>
            <Textarea
              required
              value={formData.posologia}
              onChange={(e) => setFormData((p) => ({ ...p, posologia: e.target.value }))}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Prescrição'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
