import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const orgSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  horario_funcionamento: z.string().optional(),
  logo_url: z.string().optional(),
})

const profSchema = z.object({
  id: z.string().optional(),
  nome_completo: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().optional(),
  tipo_registro: z.string().min(1, 'Tipo de registro é obrigatório'),
  numero_registro: z.string().optional(),
  especialidade: z.string().optional(),
  foto_url: z.string().optional(),
  status: z.boolean().default(true),
})

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingOrg, setUploadingOrg] = useState(false)
  const [uploadingProf, setUploadingProf] = useState(false)

  const orgForm = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      horario_funcionamento: '',
      logo_url: '',
    },
  })

  const profForm = useForm<z.infer<typeof profSchema>>({
    resolver: zodResolver(profSchema),
    defaultValues: {
      nome_completo: '',
      cpf: '',
      tipo_registro: 'Conselho de Classe',
      numero_registro: '',
      especialidade: '',
      foto_url: '',
      status: true,
    },
  })

  const tipoRegistro = profForm.watch('tipo_registro')

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (org) {
        orgForm.reset({
          id: org.id,
          nome: org.nome || '',
          cnpj: org.cnpj || '',
          telefone: org.telefone || '',
          email: org.email || '',
          endereco: org.endereco || '',
          horario_funcionamento: org.horario_funcionamento || '',
          logo_url: org.logo_url || '',
        })
      }

      const { data: prof } = await supabase
        .from('profissionais')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (prof) {
        profForm.reset({
          id: prof.id,
          nome_completo: prof.nome_completo || '',
          cpf: prof.cpf || '',
          tipo_registro: prof.tipo_registro || 'Conselho de Classe',
          numero_registro: prof.numero_registro || '',
          especialidade: prof.especialidade || '',
          foto_url: prof.foto_url || '',
          status: prof.status !== false,
        })
      }
    }

    loadData()
  }, [user])

  const onSubmitOrg = async (values: z.infer<typeof orgSchema>) => {
    if (!user) return
    setLoading(true)
    try {
      const payload = {
        owner_id: user.id,
        nome: values.nome,
        cnpj: values.cnpj,
        telefone: values.telefone,
        email: values.email,
        endereco: values.endereco,
        horario_funcionamento: values.horario_funcionamento,
        logo_url: values.logo_url,
      }

      if (values.id) {
        await supabase.from('organizations').update(payload).eq('id', values.id)
      } else {
        const { data } = await supabase.from('organizations').insert(payload).select().single()
        if (data) orgForm.setValue('id', data.id)
      }
      toast({ title: 'Sucesso', description: 'Dados da clínica atualizados.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar dados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const onSubmitProf = async (values: z.infer<typeof profSchema>) => {
    if (!user) return
    setLoading(true)
    try {
      let orgId = orgForm.getValues('id')
      if (!orgId) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_id', user.id)
          .single()
        if (org) orgId = org.id
      }

      const payload = {
        user_id: user.id,
        organization_id: orgId || null,
        nome_completo: values.nome_completo,
        cpf: values.cpf,
        tipo_registro: values.tipo_registro,
        numero_registro: values.numero_registro,
        especialidade: values.especialidade,
        foto_url: values.foto_url,
        status: values.status,
      }

      if (values.id) {
        await supabase.from('profissionais').update(payload).eq('id', values.id)
      } else {
        const { data } = await supabase.from('profissionais').insert(payload).select().single()
        if (data) profForm.setValue('id', data.id)
      }
      toast({ title: 'Sucesso', description: 'Dados do profissional atualizados.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar dados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bucket: string,
    setUploading: (v: boolean) => void,
    onUpload: (url: string) => void,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error } = await supabase.storage.from(bucket).upload(fileName, file)
      if (error) throw error

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      onUpload(data.publicUrl)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha no upload da imagem.', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as informações da clínica e do seu perfil profissional.
        </p>
      </div>

      <Tabs defaultValue="clinica" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clinica">Dados da Clínica</TabsTrigger>
          <TabsTrigger value="profissional">Cadastro de Profissional</TabsTrigger>
        </TabsList>

        <TabsContent value="clinica">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Clínica</CardTitle>
              <CardDescription>Atualize as informações da sua organização.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...orgForm}>
                <form onSubmit={orgForm.handleSubmit(onSubmitOrg)} className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    {orgForm.watch('logo_url') && (
                      <img
                        src={orgForm.watch('logo_url')}
                        alt="Logo"
                        className="w-16 h-16 rounded-md object-cover border"
                      />
                    )}
                    <div className="flex-1">
                      <FormLabel>Logo da Clínica</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={uploadingOrg}
                        onChange={(e) =>
                          handleFileUpload(e, 'organizations', setUploadingOrg, (url) =>
                            orgForm.setValue('logo_url', url),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={orgForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Clínica</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name="horario_funcionamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Funcionamento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Seg-Sex das 8h às 18h" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={orgForm.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading || uploadingOrg}>
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profissional">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Profissional</CardTitle>
              <CardDescription>
                Configure seu perfil e registro profissional para emissão de prescrições.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profForm}>
                <form onSubmit={profForm.handleSubmit(onSubmitProf)} className="space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                    {profForm.watch('foto_url') && (
                      <img
                        src={profForm.watch('foto_url')}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    )}
                    <div className="flex-1 w-full">
                      <FormLabel>Foto de Perfil</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={uploadingProf}
                        onChange={(e) =>
                          handleFileUpload(e, 'profissionais', setUploadingProf, (url) =>
                            profForm.setValue('foto_url', url),
                          )
                        }
                      />
                    </div>
                    <FormField
                      control={profForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 w-full md:w-auto mt-4 md:mt-0 gap-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ativo</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profForm.control}
                      name="nome_completo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profForm.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profForm.control}
                      name="tipo_registro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Registro</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Conselho de Classe">
                                Conselho de Classe (CRM, CRN, etc)
                              </SelectItem>
                              <SelectItem value="ABRATH">ABRATH</SelectItem>
                              <SelectItem value="CONATESI">CONATESI</SelectItem>
                              <SelectItem value="Apenas CPF">Apenas CPF</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {tipoRegistro !== 'Apenas CPF' && (
                      <FormField
                        control={profForm.control}
                        name="numero_registro"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Registro</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  tipoRegistro === 'Conselho de Classe'
                                    ? 'Ex: CRM 123456'
                                    : tipoRegistro === 'ABRATH'
                                      ? 'Ex: CRTH-BR 1234'
                                      : 'Ex: 12345'
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={profForm.control}
                      name="especialidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Nutrição Clínica, Terapia Holística..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading || uploadingProf}>
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
