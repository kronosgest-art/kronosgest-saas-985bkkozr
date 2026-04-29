import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export function CreatePatientDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    cpf: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-paciente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          user_id: session?.user?.id,
        }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Erro ao criar paciente')

      toast({ title: 'Sucesso', description: 'Paciente criado com sucesso.' })
      setOpen(false)
      setFormData({ nome_completo: '', email: '', telefone: '', cpf: '' })
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
        <Button>
          <Users className="mr-2 h-4 w-4" /> Novo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nome Completo *</Label>
            <Input
              required
              value={formData.nome_completo}
              onChange={(e) => setFormData((p) => ({ ...p, nome_completo: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.telefone}
              onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input
              value={formData.cpf}
              onChange={(e) => setFormData((p) => ({ ...p, cpf: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
