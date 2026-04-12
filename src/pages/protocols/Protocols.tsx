import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Pencil, Trash, FileText, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'

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
    nome: z.string().min(1, 'O nome do protocolo é obrigatório'),
    indicacao: z.string().min(1, 'A indicação é obrigatória'),
    numeroSessoes: z.coerce.number().min(1, 'Informe um número válido de sessões'),
    tipoAplicacao: z.string().min(1, 'O tipo de aplicação é obrigatório'),
    frequencia: z.string().min(1, 'A frequência é obrigatória'),
    duracaoSessao: z.string().min(1, 'A duração da sessão é obrigatória'),
    valorTotal: z.string().min(1, 'O valor total é obrigatório'),
    tcle: z.string().min(1, 'Selecione um TCLE'),
    tcleOutro: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.tcle === 'Outro (especificar)' &&
        (!data.tcleOutro || data.tcleOutro.trim() === '')
      ) {
        return false
      }
      return true
    },
    {
      message: 'Especifique o nome do TCLE',
      path: ['tcleOutro'],
    },
  )

type ProtocolFormValues = z.infer<typeof protocolSchema>

type Protocol = ProtocolFormValues & { id: string }

const initialProtocols: Protocol[] = [
  {
    id: '1',
    nome: 'Protocolo Dor Zero com Ozonioterapia',
    indicacao:
      'Alívio de dores articulares crônicas, redução de inflamação e tratamento auxiliar para fibromialgia.',
    numeroSessoes: 10,
    tipoAplicacao: 'Injeção intra-articular + ozônio retal',
    frequencia: '2x/semana',
    duracaoSessao: '45 minutos',
    valorTotal: '2.500,00',
    tcle: 'TCLE Ozonioterapia',
  },
  {
    id: '2',
    nome: 'Revitalização Sistêmica Integral',
    indicacao: 'Desintoxicação corporal, fadiga crônica e reequilíbrio metabólico sistêmico.',
    numeroSessoes: 5,
    tipoAplicacao: 'Soroterapia endovenosa ortomolecular',
    frequencia: '1x/semana',
    duracaoSessao: '60 minutos',
    valorTotal: '1.800,00',
    tcle: 'Outro (especificar)',
    tcleOutro: 'TCLE Soroterapia Integrativa',
  },
]

export default function Protocols() {
  const [protocols, setProtocols] = useState<Protocol[]>(initialProtocols)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      nome: '',
      indicacao: '',
      numeroSessoes: 1,
      tipoAplicacao: '',
      frequencia: '',
      duracaoSessao: '',
      valorTotal: '',
      tcle: '',
      tcleOutro: '',
    },
  })

  const onSubmit = (data: ProtocolFormValues) => {
    if (editingId) {
      setProtocols((prev) => prev.map((p) => (p.id === editingId ? { ...data, id: editingId } : p)))
      toast.success('Protocolo atualizado com sucesso!')
    } else {
      const newProtocol = { ...data, id: Math.random().toString(36).substring(2, 9) }
      setProtocols((prev) => [newProtocol, ...prev])
      toast.success('Protocolo salvo com sucesso!')
    }

    setIsFormOpen(false)
    setEditingId(null)
    form.reset()
  }

  const handleEdit = (protocol: Protocol) => {
    setEditingId(protocol.id)
    form.reset({
      nome: protocol.nome,
      indicacao: protocol.indicacao,
      numeroSessoes: protocol.numeroSessoes,
      tipoAplicacao: protocol.tipoAplicacao,
      frequencia: protocol.frequencia,
      duracaoSessao: protocol.duracaoSessao,
      valorTotal: protocol.valorTotal,
      tcle: protocol.tcle,
      tcleOutro: protocol.tcleOutro || '',
    })
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este protocolo?')) {
      setProtocols((prev) => prev.filter((p) => p.id !== id))
      toast.success('Protocolo removido com sucesso!')
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
                    name="nome"
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
                    name="tipoAplicacao"
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
                      name="numeroSessoes"
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
                      name="duracaoSessao"
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

                  <FormField
                    control={form.control}
                    name="valorTotal"
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
                    name="tcle"
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

                  {form.watch('tcle') === 'Outro (especificar)' && (
                    <FormField
                      control={form.control}
                      name="tcleOutro"
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

        {protocols.length === 0 ? (
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
                      {p.nome}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
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
                    {p.indicacao}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-md">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Sessões</p>
                      <p className="font-semibold text-slate-700">
                        {p.numeroSessoes}{' '}
                        <span className="text-xs font-normal">({p.frequencia})</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Duração</p>
                      <p className="font-semibold text-slate-700">{p.duracaoSessao}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase">
                        Aplicação
                      </p>
                      <p className="font-semibold text-slate-700">{p.tipoAplicacao}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="inline-flex items-center text-xs bg-[#B8860B]/10 text-[#B8860B] px-2 py-1 rounded-md font-medium">
                      <FileText className="w-3 h-3 mr-1.5" />
                      {p.tcle === 'Outro (especificar)' ? p.tcleOutro : p.tcle}
                    </p>
                    <p className="font-bold text-[#1E3A8A]">R$ {p.valorTotal}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
