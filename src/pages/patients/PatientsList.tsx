import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, UserPlus, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

  useEffect(() => {
    if (user?.id) {
      fetchPatients()
    }
  }, [user?.id])

  const fetchPatients = async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
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
        .from('patients')
        .insert({
          name: newPatient.name,
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

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Pacientes</h2>
          <p className="text-muted-foreground">Gerencie os pacientes da clínica.</p>
        </div>
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
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-[#1E3A8A]/5 last:border-0 hover:bg-[#1E3A8A]/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">{patient.name}</td>
                      <td className="px-6 py-4 text-slate-600">{patient.cpf}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            patient.status?.toLowerCase() === 'ativo' ? 'default' : 'secondary'
                          }
                          className={
                            patient.status?.toLowerCase() === 'ativo'
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
    </div>
  )
}
