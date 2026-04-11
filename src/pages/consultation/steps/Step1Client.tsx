import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Loader2, User, Check, ChevronsUpDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  nome_completo: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().min(11, 'CPF inválido'),
  dataNascimento: z.string(),
  sexo: z.string(),
  telefone: z.string(),
  email: z.string().email('Email inválido'),
  endereco: z.string(),
  profissao: z.string(),
  obs: z.string().optional(),
})

interface Step1ClientProps {
  data?: any
  onChange?: (data: any) => void
}

export default function Step1Client({ data, onChange }: Step1ClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingPatients, setExistingPatients] = useState<any[]>([])
  const [selectedExistingId, setSelectedExistingId] = useState<string>('new')
  const [open, setOpen] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return
      const { data } = await supabase
        .from('pacientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_completo')
      if (data) setExistingPatients(data)
    }
    fetchPatients()
  }, [user])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_completo: '',
      cpf: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      sexo: '',
      endereco: '',
      profissao: '',
      obs: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (selectedExistingId !== 'new') {
        const { data: updateData, error } = await supabase
          .from('pacientes')
          .update({
            nome_completo: values.nome_completo,
            cpf: values.cpf || null,
            email: values.email || null,
            telefone: values.telefone || null,
            data_nascimento: values.dataNascimento || null,
            sexo: values.sexo || null,
            endereco: values.endereco || null,
            profissao: values.profissao || null,
            observacoes: values.obs || null,
          })
          .eq('id', selectedExistingId)
          .select()
          .single()

        if (error) throw error

        toast({ title: 'Sucesso', description: 'Dados do paciente atualizados com sucesso!' })
        onChange?.({
          patient_id: updateData.id,
          name: updateData.nome_completo,
          cpf: updateData.cpf,
        })
      } else {
        const { data: responseData, error } = await supabase.functions.invoke('create-paciente', {
          body: {
            ...values,
            user_id: user?.id,
            organization_id: null,
          },
        })

        if (error) throw error
        if (responseData && responseData.error) throw new Error(responseData.error)

        toast({ title: 'Sucesso', description: 'Paciente salvo com sucesso!' })

        if (responseData && responseData.data) {
          onChange?.({
            patient_id: responseData.data.id,
            name: responseData.data.nome_completo,
            cpf: responseData.data.cpf,
          })
        }
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar paciente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (data?.patient_id) {
    return (
      <div className="space-y-6 animate-slide-in-right">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Cadastro de Cliente</h2>
          <p className="text-muted-foreground">Paciente identificado e associado à consulta.</p>
        </div>
        <div className="p-8 bg-green-50 text-green-800 rounded-xl border border-green-200 flex flex-col items-center text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <User className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-2xl mb-1">{data.name}</h3>
            <p className="text-sm font-medium opacity-80">CPF: {data.cpf}</p>
            <p className="text-xs opacity-60 mt-2 font-mono bg-green-100 px-2 py-1 rounded inline-block">
              ID: {data.patient_id}
            </p>
          </div>
          <Button
            onClick={() => {
              onChange?.({ patient_id: null, name: '', cpf: '' })
              form.reset()
              setSelectedExistingId('new')
            }}
            variant="outline"
            className="mt-6 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800"
          >
            Cadastrar Outro Paciente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Cadastro de Cliente</h2>
          <p className="text-muted-foreground">
            Preencha os dados básicos do paciente para iniciar o prontuário.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 shadow-sm">
        <FormLabel className="text-base mb-2 block">
          Selecione um Paciente Existente ou Cadastre um Novo
        </FormLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between md:w-[400px] h-12 bg-white"
            >
              {selectedExistingId === 'new'
                ? 'Novo Paciente (Cadastrar)'
                : existingPatients.find((p) => p.id === selectedExistingId)?.nome_completo ||
                  'Selecione o paciente...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full md:w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Buscar paciente..." />
              <CommandList>
                <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="novo paciente cadastrar"
                    onSelect={() => {
                      setSelectedExistingId('new')
                      form.reset({
                        nome_completo: '',
                        cpf: '',
                        email: '',
                        telefone: '',
                        dataNascimento: '',
                        sexo: '',
                        endereco: '',
                        profissao: '',
                        obs: '',
                      })
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedExistingId === 'new' ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    Novo Paciente (Cadastrar)
                  </CommandItem>
                  {existingPatients.map((p) => {
                    const anyP = p as any
                    return (
                      <CommandItem
                        key={p.id}
                        value={`${p.nome_completo} ${p.cpf || ''}`}
                        onSelect={() => {
                          setSelectedExistingId(p.id)
                          form.reset({
                            nome_completo: anyP.nome_completo || '',
                            cpf: anyP.cpf || '',
                            email: anyP.email || '',
                            telefone: anyP.telefone || '',
                            dataNascimento: anyP.data_nascimento || '',
                            sexo: anyP.sexo || '',
                            endereco: anyP.endereco || '',
                            profissao: anyP.profissao || '',
                            obs: anyP.observacoes || '',
                          })
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedExistingId === p.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {p.nome_completo} {p.cpf ? `(${p.cpf})` : ''}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Form {...form}>
        <form
          id="step1-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FormField
            control={form.control}
            name="nome_completo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input id="nome_completo" placeholder="Ex: João da Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input id="cpf" placeholder="000.000.000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataNascimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (WhatsApp)</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 90000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input id="email" placeholder="joao@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Endereço Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, Número, Bairro, Cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="obs"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observações Gerais</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informações relevantes sobre o paciente..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2 flex justify-end mt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[200px] h-12 text-lg"
            >
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Salvar e Associar Paciente
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
