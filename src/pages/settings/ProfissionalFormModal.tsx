import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { toast } from '@/hooks/use-toast'

export default function ProfissionalFormModal({
  isOpen,
  onClose,
  onReload,
  organizationId,
  profissionalToEdit,
}: {
  isOpen: boolean
  onClose: () => void
  onReload: () => void
  organizationId: string | null
  profissionalToEdit?: any
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    especialidade: '',
    numero_registro: '',
    password: '',
    confirmPassword: '',
    status: true,
  })

  useEffect(() => {
    if (isOpen) {
      if (profissionalToEdit) {
        setFormData({
          nome_completo: profissionalToEdit.nome_completo || '',
          email: profissionalToEdit.email || '',
          telefone: profissionalToEdit.telefone || '',
          especialidade: profissionalToEdit.especialidade || '',
          numero_registro: profissionalToEdit.numero_registro || '',
          password: '',
          confirmPassword: '',
          status: profissionalToEdit.status ?? true,
        })
      } else {
        setFormData({
          nome_completo: '',
          email: '',
          telefone: '',
          especialidade: '',
          numero_registro: '',
          password: '',
          confirmPassword: '',
          status: true,
        })
      }
    }
  }, [isOpen, profissionalToEdit])

  const handleSave = async () => {
    if (!formData.nome_completo || !formData.email || (!profissionalToEdit && !formData.password)) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha os campos obrigatórios.',
      })
      return
    }

    if (!profissionalToEdit) {
      if (formData.password.length < 8) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Senha deve ter no mínimo 8 caracteres.',
        })
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ variant: 'destructive', title: 'Erro', description: 'As senhas não coincidem.' })
        return
      }
    }

    setLoading(true)

    try {
      if (profissionalToEdit) {
        const { error } = await supabase
          .from('profissionais')
          .update({
            nome_completo: formData.nome_completo,
            telefone: formData.telefone,
            especialidade: formData.especialidade,
            numero_registro: formData.numero_registro,
            status: formData.status,
          })
          .eq('id', profissionalToEdit.id)

        if (error) throw error
        toast({ title: 'Sucesso', description: 'Profissional atualizado com sucesso.' })
      } else {
        const { data, error } = await supabase.functions.invoke('create-profissional', {
          body: {
            ...formData,
            organization_id: organizationId,
            tipo_profissional: 'profissional_cadastrado',
          },
        })
        if (error || (data && data.error)) {
          throw new Error(error?.message || data?.error)
        }
        toast({ title: 'Sucesso', description: 'Profissional cadastrado com sucesso.' })
      }
      onClose()
      onReload()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#333333] text-white border-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#C5A059]">
            {profissionalToEdit ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label>Nome Completo *</Label>
            <Input
              value={formData.nome_completo}
              onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059]"
            />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059]"
              disabled={!!profissionalToEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059]"
            />
          </div>
          <div className="space-y-2">
            <Label>Especialidade</Label>
            <Input
              value={formData.especialidade}
              onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
              className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059]"
            />
          </div>
          <div className="space-y-2">
            <Label>Registro (CRM, CRN...)</Label>
            <Input
              value={formData.numero_registro}
              onChange={(e) => setFormData({ ...formData, numero_registro: e.target.value })}
              className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059]"
            />
          </div>

          {!profissionalToEdit && (
            <>
              <div className="space-y-2">
                <Label>Senha (min. 8 caracteres) *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059]"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar Senha *</Label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059]"
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-2 mt-2">
            <Switch
              checked={formData.status}
              onCheckedChange={(c) => setFormData({ ...formData, status: c })}
              id="status-prof"
            />
            <Label htmlFor="status-prof">Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-none text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
