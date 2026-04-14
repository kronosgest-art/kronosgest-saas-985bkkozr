import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [orgId, setOrgId] = useState<string | null>(null)
  const [clinicForm, setClinicForm] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    horario_funcionamento: '',
    logo_url: '',
  })

  const [profId, setProfId] = useState<string | null>(null)
  const [profForm, setProfForm] = useState({
    nome_completo: '',
    cpf: '',
    tipo_registro: 'Apenas CPF',
    numero_registro: '',
    especialidade: '',
    foto_url: '',
    status: true,
    google_calendar_id: '',
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user?.id)
        .maybeSingle()

      if (orgData) {
        setOrgId(orgData.id)
        setClinicForm({
          nome: orgData.nome || '',
          cnpj: orgData.cnpj || '',
          telefone: orgData.telefone || '',
          email: orgData.email || '',
          endereco: orgData.endereco || '',
          horario_funcionamento: orgData.horario_funcionamento || '',
          logo_url: orgData.logo_url || '',
        })
      }

      const { data: profData } = await supabase
        .from('profissionais')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (profData) {
        setProfId(profData.id)

        let autoCalendarId = profData.google_calendar_id || ''

        // Auto-detect Gmail and auto-fill Google Calendar ID
        if (!autoCalendarId && user?.email?.endsWith('@gmail.com')) {
          autoCalendarId = user.email

          await supabase
            .from('profissionais')
            .update({ google_calendar_id: autoCalendarId })
            .eq('id', profData.id)

          toast({
            title: 'Sincronização',
            description: `✅ Google Calendar conectado automaticamente com ${user.email}`,
          })
        }

        setProfForm({
          nome_completo: profData.nome_completo || '',
          cpf: profData.cpf || '',
          tipo_registro: profData.tipo_registro || 'Apenas CPF',
          numero_registro: profData.numero_registro || '',
          especialidade: profData.especialidade || '',
          foto_url: profData.foto_url || '',
          status: profData.status ?? true,
          google_calendar_id: autoCalendarId,
        })
      } else if (user?.email?.endsWith('@gmail.com')) {
        setProfForm((prev) => ({ ...prev, google_calendar_id: user.email! }))
      }
    } catch (error) {
      console.error('Error loading settings', error)
    }
  }

  const handleSaveClinic = async () => {
    if (!user) return
    setLoading(true)
    try {
      if (orgId) {
        await supabase
          .from('organizations')
          .update({
            ...clinicForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orgId)
      } else {
        const { data } = await supabase
          .from('organizations')
          .insert({
            ...clinicForm,
            owner_id: user.id,
          })
          .select()
          .single()
        if (data) setOrgId(data.id)
      }
      toast({ title: 'Sucesso', description: 'Dados da clínica salvos com sucesso.' })
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProf = async () => {
    if (!user) return
    setLoading(true)
    try {
      if (profId) {
        await supabase
          .from('profissionais')
          .update({
            ...profForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profId)
      } else {
        const { data } = await supabase
          .from('profissionais')
          .insert({
            ...profForm,
            user_id: user.id,
            organization_id: orgId || null,
          })
          .select()
          .single()
        if (data) setProfId(data.id)
      }
      toast({ title: 'Sucesso', description: 'Dados do profissional salvos com sucesso.' })
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie os dados da sua clínica e do seu perfil profissional.
        </p>
      </div>

      <Tabs defaultValue="clinica" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clinica">Dados da Clínica</TabsTrigger>
          <TabsTrigger value="profissionais">Cadastro Profissional</TabsTrigger>
        </TabsList>

        <TabsContent value="clinica">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Clínica</CardTitle>
              <CardDescription>Informações principais da sua organização.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome da Clínica</Label>
                  <Input
                    placeholder="Clínica Exemplo"
                    value={clinicForm.nome}
                    onChange={(e) => setClinicForm({ ...clinicForm, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={clinicForm.cnpj}
                    onChange={(e) => setClinicForm({ ...clinicForm, cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={clinicForm.telefone}
                    onChange={(e) => setClinicForm({ ...clinicForm, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="contato@clinica.com"
                    value={clinicForm.email}
                    onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                    type="email"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    placeholder="Rua Exemplo, 123 - Cidade/UF"
                    value={clinicForm.endereco}
                    onChange={(e) => setClinicForm({ ...clinicForm, endereco: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário de Funcionamento</Label>
                  <Input
                    placeholder="Seg a Sex, 08h às 18h"
                    value={clinicForm.horario_funcionamento}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, horario_funcionamento: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo (URL)</Label>
                  <Input
                    placeholder="https://exemplo.com/logo.png"
                    value={clinicForm.logo_url}
                    onChange={(e) => setClinicForm({ ...clinicForm, logo_url: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveClinic} disabled={loading} className="mt-4">
                Salvar Clínica
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profissionais">
          <Card>
            <CardHeader>
              <CardTitle>Seu Perfil Profissional</CardTitle>
              <CardDescription>
                Configure seus dados para emissão de prescrições e relatórios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    placeholder="Dr. Nome"
                    value={profForm.nome_completo}
                    onChange={(e) => setProfForm({ ...profForm, nome_completo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={profForm.cpf}
                    onChange={(e) => setProfForm({ ...profForm, cpf: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Registro</Label>
                  <Select
                    value={profForm.tipo_registro}
                    onValueChange={(v) => setProfForm({ ...profForm, tipo_registro: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conselho de Classe">
                        Conselho de Classe (CRM, CRN, etc)
                      </SelectItem>
                      <SelectItem value="ABRATH">ABRATH</SelectItem>
                      <SelectItem value="CONATESI">CONATESI</SelectItem>
                      <SelectItem value="Apenas CPF">Apenas CPF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {profForm.tipo_registro !== 'Apenas CPF' && (
                  <div className="space-y-2">
                    <Label>Número do Registro</Label>
                    <Input
                      placeholder="Ex: CRM-SP 123456"
                      value={profForm.numero_registro}
                      onChange={(e) =>
                        setProfForm({ ...profForm, numero_registro: e.target.value })
                      }
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input
                    placeholder="Clínico Geral"
                    value={profForm.especialidade}
                    onChange={(e) => setProfForm({ ...profForm, especialidade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Foto/Avatar (URL)</Label>
                  <Input
                    placeholder="https://exemplo.com/avatar.png"
                    value={profForm.foto_url}
                    onChange={(e) => setProfForm({ ...profForm, foto_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>
                    {user?.email?.endsWith('@gmail.com')
                      ? 'Google Calendar ID'
                      : 'Google Calendar ID (opcional)'}
                  </Label>
                  <Input
                    placeholder="exemplo@group.calendar.google.com"
                    value={profForm.google_calendar_id}
                    onChange={(e) =>
                      setProfForm({ ...profForm, google_calendar_id: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Necessário para sincronização automática de agendamentos.
                  </p>
                  {!user?.email?.endsWith('@gmail.com') && (
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-500 mt-2">
                      Se você não tem Gmail, crie uma conta gratuita para sincronizar agendamentos
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2 flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Status da Conta</Label>
                    <p className="text-sm text-muted-foreground">
                      Profissionais inativos não podem acessar o sistema.
                    </p>
                  </div>
                  <Switch
                    checked={profForm.status}
                    onCheckedChange={(v) => setProfForm({ ...profForm, status: v })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveProf} disabled={loading} className="mt-4">
                Salvar Perfil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
