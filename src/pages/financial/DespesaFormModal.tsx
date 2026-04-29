import { useState } from 'react'
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
import { toast } from '@/hooks/use-toast'

export default function DespesaFormModal({
  isOpen,
  onClose,
  onReload,
}: {
  isOpen: boolean
  onClose: () => void
  onReload: () => void
}) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    categoria: '',
    descricao: '',
    valor: '',
    data_despesa: new Date().toISOString().split('T')[0],
    forma_pagamento: 'Pix',
    tipo_conta: 'Conta Empresa',
    banco_retirada: '',
    recorrente: false,
    frequencia_recorrencia: 'mensal',
    status: 'paga',
  })

  const handleSave = async () => {
    if (
      !formData.categoria ||
      !formData.descricao ||
      !formData.valor ||
      !formData.data_despesa ||
      !formData.forma_pagamento ||
      !formData.tipo_conta ||
      !formData.status
    ) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    if (Number(formData.valor) <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor deve ser maior que zero.',
        variant: 'destructive',
      })
      return
    }
    if (formData.recorrente && !formData.frequencia_recorrencia) {
      toast({
        title: 'Erro',
        description: 'Selecione a frequência para despesas recorrentes.',
        variant: 'destructive',
      })
      return
    }
    if (['Pix', 'Cartão'].includes(formData.forma_pagamento) && !formData.banco_retirada) {
      toast({
        title: 'Erro',
        description: 'Banco que Retirou é obrigatório para Pix ou Cartão.',
        variant: 'destructive',
      })
      return
    }

    const { error } = await supabase.from('despesas').insert({
      user_id: user?.id,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: Number(formData.valor),
      data_despesa: formData.data_despesa,
      forma_pagamento: formData.forma_pagamento,
      tipo_conta: formData.tipo_conta,
      banco_retirada: ['Pix', 'Cartão'].includes(formData.forma_pagamento)
        ? formData.banco_retirada
        : null,
      recorrente: formData.recorrente,
      frequencia_recorrencia: formData.recorrente ? formData.frequencia_recorrencia : null,
      status: formData.status,
    })

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao cadastrar despesa.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Despesa cadastrada com sucesso!' })
      setFormData({
        categoria: '',
        descricao: '',
        valor: '',
        data_despesa: new Date().toISOString().split('T')[0],
        forma_pagamento: 'Pix',
        tipo_conta: 'Conta Empresa',
        banco_retirada: '',
        recorrente: false,
        frequencia_recorrencia: 'mensal',
        status: 'paga',
      })
      onClose()
      onReload()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#333333] text-white border-none sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-[#C5A059]">Nova Despesa</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(v) => setFormData({ ...formData, categoria: v })}
              >
                <SelectTrigger className="bg-transparent border-[#C5A059] focus:ring-[#C5A059]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Insumos', 'Salário', 'Aluguel', 'Cursos', 'Utilitários', 'Outros'].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.data_despesa}
                onChange={(e) => setFormData({ ...formData, data_despesa: e.target.value })}
                className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059] [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059] placeholder:text-gray-500"
              placeholder="Ex: Material de escritório"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Forma de Pag. *</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
              >
                <SelectTrigger className="bg-transparent border-[#C5A059] focus:ring-[#C5A059]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Conta *</Label>
              <Select
                value={formData.tipo_conta}
                onValueChange={(v) => setFormData({ ...formData, tipo_conta: v })}
              >
                <SelectTrigger className="bg-transparent border-[#C5A059] focus:ring-[#C5A059]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conta Empresa">Conta Empresa</SelectItem>
                  <SelectItem value="Conta Pessoa Física">Conta Pessoa Física</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {['Pix', 'Cartão'].includes(formData.forma_pagamento) && (
            <div className="space-y-2 animate-fade-in">
              <Label>Banco que Retirou *</Label>
              <Input
                value={formData.banco_retirada}
                onChange={(e) => setFormData({ ...formData, banco_retirada: e.target.value })}
                className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059] placeholder:text-gray-500"
                placeholder="Ex: Itaú, Bradesco, Nubank, Caixa"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059]"
              />
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="bg-transparent border-[#C5A059] focus:ring-[#C5A059]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paga">Paga</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Switch
              checked={formData.recorrente}
              onCheckedChange={(c) => setFormData({ ...formData, recorrente: c })}
              id="recorrente"
            />
            <Label htmlFor="recorrente">Despesa Recorrente</Label>
          </div>
          {formData.recorrente && (
            <div className="space-y-2 animate-fade-in">
              <Label>Frequência *</Label>
              <Select
                value={formData.frequencia_recorrencia}
                onValueChange={(v) => setFormData({ ...formData, frequencia_recorrencia: v })}
              >
                <SelectTrigger className="bg-transparent border-[#C5A059] focus:ring-[#C5A059]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-none text-gray-300 hover:bg-gray-800 bg-transparent min-h-[44px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0] min-h-[44px]"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
