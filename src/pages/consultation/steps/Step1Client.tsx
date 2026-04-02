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
import { useState } from 'react'
import { Loader2, User } from 'lucide-react'

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
  const { toast } = useToast()
  const { user } = useAuth()

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
      const { data: responseData, error } = await supabase.functions.invoke('create-paciente', {
        body: {
          ...values,
          user_id: user?.id,
          organization_id: null,
        },
      })

      if (error) throw error
      if (responseData && responseData.error) throw new Error(responseData.error)

      toast({
        title: 'Sucesso',
        description: 'Paciente salvo com sucesso!',
      })

      if (responseData && responseData.data) {
        onChange?.({
          patient_id: responseData.data.id,
          name: responseData.data.nome_completo,
          cpf: responseData.data.cpf,
        })
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
      <div>
        <h2 className="text-2xl font-semibold text-primary">Cadastro de Cliente</h2>
        <p className="text-muted-foreground">
          Preencha os dados básicos do paciente para iniciar o prontuário.
        </p>
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
