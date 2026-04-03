import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  UserPlus,
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  CalendarDays,
  FileText,
  FileSignature,
  BrainCircuit,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function PatientsList() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: '',
    cpf: '',
    status: 'Ativo',
  })

  const [deletingPatient, setDeletingPatient] = useState<any>(null)
  const [viewingPatient, setViewingPatient] = useState<any>(null)
  const [patientRecord, setPatientRecord] = useState<any>(null)
  const [isLoadingRecord, setIsLoadingRecord] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchPatients()
    }
  }, [user?.id])

  const fetchPatients = async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('pacientes')
      .select('*')
      .or(`user_id.eq.${user.id},organization_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    if (data) setPatients(data)
  }

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.cpf) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, preencha o nome e CPF do paciente.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert({
          nome_completo: newPatient.name,
          cpf: newPatient.cpf,
          status: newPatient.status,
          user_id: user?.id,
        })
        .select()
        .single()

      if (error) throw error

      setPatients([data, ...patients])
      setIsDialogOpen(false)
      setNewPatient({ name: '', cpf: '', status: 'Ativo' })
      toast({ title: 'Sucesso', description: 'Novo paciente adicionado com sucesso.' })
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro ao cadastrar o paciente.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePatient = async () => {
    if (!deletingPatient) return
    try {
      const { error } = await supabase.from('pacientes').delete().eq('id', deletingPatient.id)
      if (error) throw error
      setPatients(patients.filter((p) => p.id !== deletingPatient.id))
      toast({ title: 'Sucesso', description: '✓ Paciente excluído com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    } finally {
      setDeletingPatient(null)
    }
  }

  const handleViewPatient = async (patient: any) => {
    setViewingPatient(patient)
    setIsLoadingRecord(true)
    try {
      const { data: anamneses } = await supabase
        .from('anamnese')
        .select('*')
        .eq('patient_id', patient.id)
        .order('criado_em', { ascending: false })
      const { data: exames } = await supabase
        .from('exames')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('patient_id', patient.id)
        .order('data', { ascending: false })

      setPatientRecord({ anamneses, exames, agendamentos })
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar prontuário',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoadingRecord(false)
    }
  }

  const filteredPatients = patients.filter((p) =>
    p.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Pacientes</h2>
          <p className="text-muted-foreground">Gerencie os pacientes da clínica.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchPatients}
            className="border-[#1E3A8A]/20 text-[#1E3A8A] hover:bg-[#1E3A8A]/5"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Recarregar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1E3A8A] text-white hover:bg-[#152865] transition-colors">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-[#1E3A8A]">Adicionar Paciente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    placeholder="Ex: Maria Souza"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={newPatient.cpf}
                    onChange={(e) => setNewPatient({ ...newPatient, cpf: e.target.value })}
                    className="border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-[#1E3A8A]/20"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-[#1E3A8A] text-white hover:bg-[#152865]"
                  onClick={handleAddPatient}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salvar Paciente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-[#1E3A8A]/10 shadow-sm bg-white">
        <CardHeader className="bg-transparent border-b border-[#1E3A8A]/5">
          <CardTitle className="text-[#1E3A8A]">Lista de Pacientes</CardTitle>
          <CardDescription>Visualize e busque todos os pacientes cadastrados.</CardDescription>
          <div className="mt-4 flex max-w-sm items-center space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome..."
                className="w-full pl-8 border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1E3A8A]/5 text-[#1E3A8A] border-b border-[#1E3A8A]/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nome</th>
                  <th className="px-6 py-4 font-semibold">CPF</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Última Consulta</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-[#1E3A8A]/5 last:border-0 hover:bg-[#1E3A8A]/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {patient.nome_completo}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{patient.cpf}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            (patient.status || 'Ativo').toLowerCase() === 'ativo'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            (patient.status || 'Ativo').toLowerCase() === 'ativo'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-none'
                          }
                        >
                          {patient.status || 'Ativo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {patient.last_consultation
                          ? new Date(patient.last_consultation).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPatient(patient)}
                            title="Ver Prontuário"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingPatient(patient)}
                            title="Excluir Paciente"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhum paciente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingPatient} onOpenChange={() => setDeletingPatient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente{' '}
              <strong>{deletingPatient?.nome_completo}</strong>? Esta ação é irreversível e apagará
              todos os dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={!!viewingPatient} onOpenChange={(o) => !o && setViewingPatient(null)}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg border-l border-primary/20">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl text-primary flex items-center gap-2">
              <FileText className="w-6 h-6" /> Prontuário Eletrônico
            </SheetTitle>
            <SheetDescription>Visualização unificada do histórico do paciente.</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)] pr-4">
            {isLoadingRecord ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : patientRecord ? (
              <div className="space-y-8 pb-8">
                <div className="p-4 bg-muted/40 rounded-xl border border-primary/10 space-y-2">
                  <h3 className="font-semibold text-lg">{viewingPatient?.nome_completo}</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>CPF:</strong> {viewingPatient?.cpf || 'Não informado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Email:</strong> {viewingPatient?.email || 'Não informado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Telefone:</strong> {viewingPatient?.telefone || 'Não informado'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 border-b pb-2">
                    <CalendarDays className="w-4 h-4 text-primary" /> Consultas Agendadas
                  </h4>
                  {patientRecord.agendamentos?.length > 0 ? (
                    <ul className="space-y-3">
                      {patientRecord.agendamentos.map((a: any) => (
                        <li key={a.id} className="p-3 bg-white border rounded-lg shadow-sm">
                          <p className="font-medium">
                            {new Date(a.data).toLocaleDateString('pt-BR')} às {a.horario}
                          </p>
                          <p className="text-xs text-muted-foreground">Tipo: {a.tipo_consulta}</p>
                          {a.observacoes && (
                            <p className="text-xs mt-1 italic">"{a.observacoes}"</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum agendamento.</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 border-b pb-2">
                    <FileSignature className="w-4 h-4 text-primary" /> Anamneses
                  </h4>
                  {patientRecord.anamneses?.length > 0 ? (
                    <ul className="space-y-3">
                      {patientRecord.anamneses.map((a: any) => (
                        <li
                          key={a.anamnese_id}
                          className="p-3 bg-white border rounded-lg shadow-sm"
                        >
                          <p className="font-medium text-sm">
                            Data: {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {a.assinatura_paciente ? 'Assinada' : 'Pendente Assinatura'}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma anamnese preenchida.</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 border-b pb-2">
                    <BrainCircuit className="w-4 h-4 text-primary" /> Exames e Interpretações IA
                  </h4>
                  {patientRecord.exames?.length > 0 ? (
                    <ul className="space-y-3">
                      {patientRecord.exames.map((e: any) => (
                        <li
                          key={e.id}
                          className="p-3 bg-white border border-l-4 border-l-primary rounded-lg shadow-sm space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                              {e.tipo}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(e.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {e.interpretacao_ia ? (
                            <div className="bg-muted/30 p-2 rounded text-xs text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto mt-2">
                              {e.interpretacao_ia}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Sem interpretação gerada.
                            </p>
                          )}
                          {e.arquivo_pdf_url && (
                            <a
                              href={e.arquivo_pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline block mt-2"
                            >
                              Ver Arquivo Original
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum exame anexado.</p>
                  )}
                </div>
              </div>
            ) : null}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
