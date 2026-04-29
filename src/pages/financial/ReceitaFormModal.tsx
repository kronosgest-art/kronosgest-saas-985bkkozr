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
import { toast } from '@/hooks/use-toast'

export default function ReceitaFormModal({
  isOpen,
  onClose,
  onReload,
}: {
  isOpen: boolean
  onClose: () => void
  onReload: () => void
}) {
  const { user } = useAuth()
  const [protocolos, setProtocolos] = useState<any[]>([])
  const [loadingProts, setLoadingProts] = useState(false)

  const [formData, setFormData] = useState({
    tipo_receita: 'Protocolo',
    protocolo_id: '',
    descricao_customizada: '',
    valor: '',
    data_receita: new Date().toISOString().split('T')[0],
    forma_pagamento: 'Pix',
    recorrente: false,
    frequencia_recorrencia: 'mensal',
    status: 'paga',
  })

  useEffect(() => {
    if (isOpen && user) {
      setLoadingProts(true)
      supabase
        .from('protocolos')
        .select('id, nome, valor_total')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setProtocolos(data)
          setLoadingProts(false)
        })
    }
  }, [isOpen, user])

  const handleSave = async () => {
    if (
      !formData.tipo_receita ||
      !formData.valor ||
      !formData.data_receita ||
      !formData.forma_pagamento ||
      !formData.status
    ) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    if (formData.tipo_receita === 'Protocolo' && !formData.protocolo_id) {
      toast({ title: 'Erro', description: 'Selecione um protocolo.', variant: 'destructive' })
      return
    }
    if (formData.tipo_receita === 'Outro' && !formData.descricao_customizada) {
      toast({ title: 'Erro', description: 'Preencha a descrição.', variant: 'destructive' })
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
      toast({ title: 'Erro', description: 'Selecione a frequência.', variant: 'destructive' })
      return
    }

    const insertData = {
      user_id: user?.id,
      tipo_receita: formData.tipo_receita,
      protocolo_id: formData.tipo_receita === 'Protocolo' ? formData.protocolo_id : null,
      descricao_customizada:
        formData.tipo_receita === 'Outro' ? formData.descricao_customizada : null,
      valor: Number(formData.valor),
      data_receita: formData.data_receita,
      forma_pagamento: formData.forma_pagamento,
      recorrente: formData.recorrente,
      frequencia_recorrencia: formData.recorrente ? formData.frequencia_recorrencia : null,
      status: formData.status,
    }

    const { error } = await supabase.from('receitas').insert(insertData)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao cadastrar receita.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Receita cadastrada com sucesso!' })
      setFormData({
        tipo_receita: 'Protocolo',
        protocolo_id: '',
        descricao_customizada: '',
        valor: '',
        data_receita: new Date().toISOString().split('T')[0],
        forma_pagamento: 'Pix',
        recorrente: false,
        frequencia_recorrencia: 'mensal',
        status: 'paga',
      })
      onClose()
      onReload()
    }
  }

  const handleProtocoloChange = (val: string) => {
    const prot = protocolos.find((p) => p.id === val)
    setFormData({
      ...formData,
      protocolo_id: val,
      valor: prot?.valor_total ? String(prot.valor_total) : formData.valor,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#333333] text-white border-none sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-[#C5A059]">Nova Receita</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Receita *</Label>
            <Select
              value={formData.tipo_receita}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  tipo_receita: v,
                  protocolo_id: '',
                  descricao_customizada: '',
                })
              }
            >
              <SelectTrigger className="bg-transparent border-[#C5A059] focus:ring-[#C5A059]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Protocolo">Protocolo</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo_receita === 'Protocolo' && (
            <div className="space-y-2 animate-fade-in">
              <Label>Protocolo *</Label>
              {loadingProts ? (
                <div className="text-sm text-gray-400">Carregando protocolos...</div>
              ) : protocolos.length === 0 ? (
                <div className="text-sm text-red-400">
                  Nenhum protocolo cadastrado. Crie um em /protocols primeiro.
                </div>
              ) : (
                <Select value={formData.protocolo_id} onValueChange={handleProtocoloChange}>
                  <SelectTrigger className="bg-transparent border-[#C5A059] focus:ring-[#C5A059]">
                    <SelectValue placeholder="Selecione um protocolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {protocolos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {formData.tipo_receita === 'Outro' && (
            <div className="space-y-2 animate-fade-in">
              <Label>Descrição *</Label>
              <Input
                value={formData.descricao_customizada}
                onChange={(e) =>
                  setFormData({ ...formData, descricao_customizada: e.target.value })
                }
                className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059] placeholder:text-gray-500"
                placeholder="Ex: Consulta avulsa"
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
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.data_receita}
                onChange={(e) => setFormData({ ...formData, data_receita: e.target.value })}
                className="bg-transparent border-[#C5A059] focus-visible:ring-[#C5A059] [color-scheme:dark]"
              />
            </div>
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
            <Label htmlFor="recorrente">Receita Recorrente</Label>
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
