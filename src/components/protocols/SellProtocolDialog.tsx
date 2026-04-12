import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart, Loader2 } from 'lucide-react'

const formSchema = z.object({
  protocolo_id: z.string().min(1, 'Selecione um protocolo'),
  patient_id: z.string().min(1, 'Selecione um paciente'),
  valor: z.coerce.number().min(0.01, 'Valor deve ser maior que 0'),
  status_pagamento: z.enum(['pendente', 'pago']),
})

export function SellProtocolDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [protocolos, setProtocolos] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      protocolo_id: '',
      patient_id: '',
      valor: 0,
      status_pagamento: 'pago',
    },
  })

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    const [protRes, pacRes] = await Promise.all([
      supabase.from('protocolos').select('id, nome, valor_total').order('nome'),
      supabase.from('pacientes').select('id, nome_completo').order('nome_completo'),
    ])
    if (protRes.data) setProtocolos(protRes.data)
    if (pacRes.data) setPacientes(pacRes.data)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      // 1. Registrar a Venda
      const { data: venda, error: vendaError } = await supabase
        .from('vendas')
        .insert({
          protocolo_id: values.protocolo_id,
          patient_id: values.patient_id,
          profissional_id: user?.id,
          valor: values.valor,
          status: 'concluido',
        })
        .select()
        .single()

      if (vendaError) throw vendaError

      // 2. Registrar a Transação Financeira integrada
      const { error: transacaoError } = await supabase.from('transacoes_financeiras').insert({
        venda_id: venda.id,
        patient_id: values.patient_id,
        protocolo_id: values.protocolo_id,
        profissional_id: user?.id,
        tipo: 'receita',
        categoria: 'protocolo',
        valor: values.valor,
        status: values.status_pagamento,
        descricao: `Venda de Protocolo Integrada`,
      })

      if (transacaoError) throw transacaoError

      toast({
        title: 'Sucesso',
        description: 'Protocolo vendido com sucesso! Transação financeira registrada.',
      })
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast({
        title: 'Erro ao processar venda',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all">
            <ShoppingCart className="h-4 w-4" />
            Vender Protocolo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vender Protocolo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pacientes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="protocolo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protocolo</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      const prot = protocolos.find((p) => p.id === val)
                      if (prot && prot.valor_total) {
                        form.setValue('valor', prot.valor_total)
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o protocolo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {protocolos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Venda
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
