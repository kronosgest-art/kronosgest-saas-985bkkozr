import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Pencil, Trash, FileText, CheckCircle2, X, ShoppingCart } from 'lucide-react'
import { SellProtocolDialog } from './SellProtocolDialog'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const protocolSchema = z
  .object({
    id: z.string().optional(),
    nome_protocolo: z.string().min(1, 'O nome do protocolo é obrigatório'),
    indicacao: z.string().min(1, 'A indicação é obrigatória'),
    numero_sessoes: z.coerce.number().min(1, 'Informe um número válido de sessões'),
    tipo_aplicacao: z.string().min(1, 'O tipo de aplicação é obrigatório'),
    frequencia: z.string().min(1, 'A frequência é obrigatória'),
    duracao_sessao: z.string().min(1, 'A duração da sessão é obrigatória'),
    valor_total: z.string().min(1, 'O valor total é obrigatório'),
    valor_sessao_avulsa: z.string().optional(),
    desconto_progressivo: z.string().optional(),
    beneficios_esperados: z.string().optional(),
    contraindicacoes: z.string().optional(),
    tipo_tcle: z.string().min(1, 'Selecione um TCLE'),
    tcle_outro: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.tipo_tcle === 'Outro (especificar)' &&
        (!data.tcle_outro || data.tcle_outro.trim() === '')
      ) {
        return false
      }
      return true
    },
    {
      message: 'Especifique o nome do TCLE',
      path: ['tcle_outro'],
    },
  )

type ProtocolFormValues = z.infer<typeof protocolSchema>

type Protocol = {
  id: string
  nome: string
  nome_protocolo: string | null
  indicacao: string | null
  numero_sessoes: number | null
  tipo_aplicacao: string | null
  frequencia: string | null
  duracao_sessao: string | null
  valor_total: number | null
  valor_sessao_avulsa: number | null
  desconto_progressivo: string | null
  beneficios_esperados: string | null
  contraindicacoes: string | null
  tipo_tcle: string | null
  tcle_outro: string | null
}

export default function Protocols() {
  const { user } = useAuth()
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sellingProtocol, setSellingProtocol] = useState<Protocol | null>(null)

  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      nome_protocolo: '',
      indicacao: '',
      numero_sessoes: 1,
      tipo_aplicacao: '',
      frequencia: '',
      duracao_sessao: '',
      valor_total: '',
      valor_sessao_avulsa: '',
      desconto_progressivo: '',
      beneficios_esperados: '',
      contraindicacoes: '',
      tipo_tcle: '',
      tcle_outro: '',
    },
  })

  const fetchProtocols = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('protocolos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProtocols(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar protocolos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProtocols()
    }
  }, [user])

  const onSubmit = async (data: ProtocolFormValues) => {
    if (!user) return

    const valorNumerico = parseFloat(data.valor_total.replace(/\./g, '').replace(',', '.') || '0')
    const valorAvulsoNumerico = data.valor_sessao_avulsa
      ? parseFloat(data.valor_sessao_avulsa.replace(/\./g, '').replace(',', '.'))
      : null

    const payload = {
      nome: data.nome_protocolo,
      nome_protocolo: data.nome_protocolo,
      indicacao: data.indicacao,
      numero_sessoes: data.numero_sessoes,
      tipo_aplicacao: data.tipo_aplicacao,
      frequencia: data.frequencia,
      duracao_sessao: data.duracao_sessao,
      valor_total: valorNumerico,
      valor_sessao_avulsa: valorAvulsoNumerico,
      desconto_progressivo: data.desconto_progressivo,
      beneficios_esperados: data.beneficios_esperados,
      contraindicacoes: data.contraindicacoes,
      tipo_tcle: data.tipo_tcle,
      tcle_outro: data.tcle_outro,
      criado_por: user.id,
      user_id: user.id,
      apenas_pacote_fechado: true,
      updated_at: new Date().toISOString(),
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('protocolos').update(payload).eq('id', editingId)

        if (error) throw error
        toast.success('Protocolo atualizado com sucesso!')
      } else {
        const { error } = await supabase.from('protocolos').insert([payload])

        if (error) throw error
        toast.success('Protocolo salvo com sucesso!')
      }

      fetchProtocols()
      setIsFormOpen(false)
      setEditingId(null)
      form.reset()
    } catch (error: any) {
      toast.error('Erro ao salvar protocolo: ' + error.message)
    }
  }

  const handleEdit = (protocol: Protocol) => {
    setEditingId(protocol.id)
    form.reset({
      nome_protocolo: protocol.nome_protocolo || protocol.nome || '',
      indicacao: protocol.indicacao || '',
      numero_sessoes: protocol.numero_sessoes || 1,
      tipo_aplicacao: protocol.tipo_aplicacao || '',
      frequencia: protocol.frequencia || '',
      duracao_sessao: protocol.duracao_sessao || '',
      valor_total: protocol.valor_total
        ? protocol.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        : '',
      valor_sessao_avulsa: protocol.valor_sessao_avulsa
        ? protocol.valor_sessao_avulsa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        : '',
      desconto_progressivo: protocol.desconto_progressivo || '',
      beneficios_esperados: protocol.beneficios_esperados || '',
      contraindicacoes: protocol.contraindicacoes || '',
      tipo_tcle: protocol.tipo_tcle || '',
      tcle_outro: protocol.tcle_outro || '',
    })
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este protocolo?')) {
      try {
        const { error } = await supabase.from('protocolos').delete().eq('id', id)

        if (error) throw error

        setProtocols((prev) => prev.filter((p) => p.id !== id))
        toast.success('Protocolo removido com sucesso!')
      } catch (error: any) {
        toast.error('Erro ao remover protocolo')
      }
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingId(null)
    form.reset()
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A8A]">Gestão de Protocolos</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie os protocolos clínicos e pacotes de tratamento.
          </p>
        </div>
        {!isFormOpen && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-[#B8860B] hover:bg-[#B8860B]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Protocolo
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card className="border-t-4 border-t-[#1E3A8A] shadow-md animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-xl text-[#1E3A8A]">
                {editingId ? 'Editar Protocolo' : 'Cadastrar Novo Protocolo'}
              </CardTitle>
              <CardDescription className="mt-1">
                Preencha os dados técnicos e comerciais do tratamento.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome_protocolo"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="font-bold text-[#1E3A8A]">
                          Nome do Protocolo *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ex: Protocolo Dor Zero com Ozonioterapia"
                            className="font-semibold border-muted-foreground/30 focus-visible:ring-[#B8860B]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="indicacao"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="font-semibold text-slate-700">
                          Indicação (Problema resolvido) *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="ex: Dores articulares crônicas, inflamação, fibromialgia..."
                            className="resize-none min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_aplicacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-700">
                          Tipo de Aplicação *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Injeção muscular + ozônio retal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numero_sessoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-slate-700">
                            Nº Sessões *
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="ex: 10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duracao_sessao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-slate-700">
                            Duração/Sessão *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="ex: 45 min" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="frequencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-700">Frequência *</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 2x/semana" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="valor_total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-[#B8860B]">
                            Valor Total (Pacote R$) *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="ex: 2500,00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="valor_sessao_avulsa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-slate-700">
                            Valor Sessão Avulsa (R$)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="ex: 350,00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="desconto_progressivo"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="font-semibold text-slate-700">
                          Desconto Progressivo / Regras
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 5 sessões = 10% desc" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficios_esperados"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="font-semibold text-slate-700">
                          Benefícios Esperados
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os benefícios esperados deste protocolo..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contraindicacoes"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="font-semibold text-slate-700">
                          Contraindicações
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Liste as contraindicações deste protocolo..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_tcle"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="font-semibold text-slate-700">
                          Termo de Consentimento (TCLE) *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o TCLE apropriado para este protocolo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TCLE Ozonioterapia">TCLE Ozonioterapia</SelectItem>
                            <SelectItem value="TCLE Terapia Neural">TCLE Terapia Neural</SelectItem>
                            <SelectItem value="TCLE Laserterapia">TCLE Laserterapia</SelectItem>
                            <SelectItem value="TCLE Biorressonância">
                              TCLE Biorressonância
                            </SelectItem>
                            <SelectItem value="Outro (especificar)">Outro (especificar)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('tipo_tcle') === 'Outro (especificar)' && (
                    <FormField
                      control={form.control}
                      name="tcle_outro"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                          <FormLabel className="font-semibold text-slate-700">
                            Especificar Nome do TCLE *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome do termo de consentimento..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 min-w-[150px]"
                  >
                    {editingId ? 'Salvar Alterações' : 'Salvar Protocolo'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#1E3A8A] flex items-center gap-2 border-b pb-2">
          <CheckCircle2 className="w-5 h-5 text-[#B8860B]" />
          Protocolos Cadastrados
        </h2>

        {isLoading ? (
          <Card className="bg-muted/30">
            <CardContent className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E3A8A] border-t-transparent" />
            </CardContent>
          </Card>
        ) : protocols.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-medium">
                Nenhum protocolo cadastrado ainda.
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Clique no botão "Novo Protocolo" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protocols.map((p) => (
              <Card
                key={p.id}
                className="border-l-4 border-l-[#B8860B] shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg text-[#1E3A8A] font-bold leading-tight">
                      {p.nome_protocolo || p.nome}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => setSellingProtocol(p)}
                        title="Vender Protocolo"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-100"
                        onClick={() => handleEdit(p)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-destructive hover:bg-red-50"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1 text-sm">
                    {p.indicacao || 'Sem indicação cadastrada.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-md">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Sessões</p>
                      <p className="font-semibold text-slate-700">
                        {p.numero_sessoes || 0}{' '}
                        <span className="text-xs font-normal">({p.frequencia || '-'})</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Duração</p>
                      <p className="font-semibold text-slate-700">{p.duracao_sessao || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase">
                        Aplicação
                      </p>
                      <p className="font-semibold text-slate-700">{p.tipo_aplicacao || '-'}</p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t space-y-3">
                    <div className="flex flex-col gap-1.5 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Pacote ({p.numero_sessoes || 0}x)
                        </span>
                        <span className="font-bold text-[#1E3A8A] text-base">
                          R${' '}
                          {p.valor_total
                            ? p.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                            : '0,00'}
                        </span>
                      </div>

                      {p.valor_sessao_avulsa && (
                        <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Sessão Avulsa
                          </span>
                          <span className="font-semibold text-slate-700">
                            R${' '}
                            {p.valor_sessao_avulsa.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}

                      {p.desconto_progressivo && (
                        <div className="text-xs text-[#B8860B] bg-[#B8860B]/5 py-1 px-2 rounded mt-1 font-medium border border-[#B8860B]/10">
                          {p.desconto_progressivo}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-md font-medium">
                        <FileText className="w-3 h-3 mr-1.5" />
                        {p.tipo_tcle === 'Outro (especificar)'
                          ? p.tcle_outro
                          : p.tipo_tcle || 'Nenhum TCLE'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SellProtocolDialog
        protocol={sellingProtocol}
        open={!!sellingProtocol}
        onOpenChange={(open) => !open && setSellingProtocol(null)}
      />
    </div>
  )
}
