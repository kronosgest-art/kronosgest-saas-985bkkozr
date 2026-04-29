import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { Loader2, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PatientAccessDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pacientes, setPacientes] = useState<any[]>([])

  const [pacienteId, setPacienteId] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [ativo, setAtivo] = useState(true)

  useEffect(() => {
    if (open) {
      loadPacientes()
      setPacienteId('')
      setEmail('')
      setCpf('')
      setAtivo(true)
    }
  }, [open])

  async function loadPacientes() {
    const { data } = await supabase
      .from('pacientes')
      .select('id, nome_completo')
      .is('deleted_at', null)
      .neq('status', 'deletado')
      .order('nome_completo')
    if (data) setPacientes(data)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!pacienteId || !email || !cpf) {
      return toast({
        title: 'Atenção',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      })
    }

    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      return toast({
        title: 'Atenção',
        description: 'O CPF deve ter 11 dígitos.',
        variant: 'destructive',
      })
    }

    setLoading(true)
    const { error } = await supabase.from('pacientes_acesso').insert({
      paciente_id: pacienteId,
      email,
      cpf: cleanCpf,
      ativo,
      criado_por: user?.id,
    })

    setLoading(false)

    if (error) {
      toast({
        title: 'Erro',
        description: 'Email ou CPF já cadastrados para acesso.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Acesso do paciente criado com sucesso!' })
      setOpen(false)
      onCreated()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#C5A059] hover:bg-[#A88640] text-[#FDFCF0]">
          <Plus className="h-4 w-4 mr-2" /> Novo Acesso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#001F3F]">Novo Acesso do Paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Select value={pacienteId} onValueChange={setPacienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente..." />
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
            <Label>Email (Login)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="paciente@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>CPF (Senha)</Label>
            <Input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Somente números"
              required
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label>Acesso Ativo</Label>
            <Switch
              checked={ativo}
              onCheckedChange={setAtivo}
              className="data-[state=checked]:bg-[#C5A059]"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="text-[#333333]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#C5A059] hover:bg-[#A88640] text-[#FDFCF0]"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
