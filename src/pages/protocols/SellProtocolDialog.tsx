import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

type Protocol = any
type Patient = { id: string; nome_completo: string }

export function SellProtocolDialog({
  protocol,
  open,
  onOpenChange,
}: {
  protocol: Protocol | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [status, setStatus] = useState('pago')
  const [valor, setValor] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && user) {
      supabase
        .from('pacientes')
        .select('id, nome_completo')
        .order('nome_completo')
        .then(({ data }) => setPatients(data || []))

      if (protocol) {
        setValor(protocol.valor_total ? protocol.valor_total.toString() : '0')
        setStatus('pago')
        setSelectedPatient('')
      }
    }
  }, [open, user, protocol])

  const handleSell = async () => {
    if (!selectedPatient) {
      toast.error('Selecione um paciente')
      return
    }
    setLoading(true)
    try {
      const venda = {
        protocolo_id: protocol.id,
        patient_id: selectedPatient,
        profissional_id: user?.id,
        valor: parseFloat(valor),
        status: status,
      }

      const { data: vendaData, error: vendaError } = await supabase
        .from('vendas')
        .insert(venda)
        .select()
        .single()

      if (vendaError) throw vendaError

      const transacao = {
        venda_id: vendaData.id,
        patient_id: selectedPatient,
        protocolo_id: protocol.id,
        profissional_id: user?.id,
        tipo: 'receita',
        categoria: 'protocolo',
        valor: parseFloat(valor),
        status: status,
        descricao: `Venda do protocolo: ${protocol.nome_protocolo || protocol.nome}`,
      }

      const { error: transacaoError } = await supabase
        .from('transacoes_financeiras')
        .insert(transacao)

      if (transacaoError) throw transacaoError

      toast.success('Protocolo vendido! Receita registrada no Financeiro')
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro ao vender protocolo: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#1E3A8A]">Vender Protocolo</DialogTitle>
          <DialogDescription>
            Registre a venda do protocolo{' '}
            <strong>{protocol?.nome_protocolo || protocol?.nome}</strong> para um paciente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Paciente *</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Nenhum paciente cadastrado
                  </SelectItem>
                ) : (
                  patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome_completo}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Valor Negociado (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Status do Pagamento *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
            onClick={handleSell}
            disabled={loading || !selectedPatient}
          >
            {loading ? 'Registrando...' : 'Confirmar Venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
