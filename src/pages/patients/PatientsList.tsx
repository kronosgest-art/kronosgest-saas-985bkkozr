import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Loader2, Phone, Mail, FileText, Trash2 } from 'lucide-react'
import { CreatePatientDialog } from './CreatePatientDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PatientAccessList } from './PatientAccessList'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'

export default function PatientsList() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPacientes() {
    setLoading(true)
    // Filter out logically deleted patients
    const { data } = await supabase
      .from('pacientes')
      .select('*')
      .is('deleted_at', null)
      .neq('status', 'deletado')
      .order('nome_completo')

    if (data) setPacientes(data)
    setLoading(false)
  }

  useEffect(() => {
    loadPacientes()
  }, [])

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('pacientes')
        .update({ deleted_at: new Date().toISOString(), status: 'deletado' })
        .eq('id', id)

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Paciente excluído com sucesso.' })
      loadPacientes()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground mt-1">Central de cadastro e prontuários.</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Pacientes</TabsTrigger>
          <TabsTrigger value="access">Acesso do Paciente</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-end">
            <CreatePatientDialog onCreated={loadPacientes} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pacientes.map((p) => (
              <Card key={p.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 border-b mb-4 flex flex-row justify-between items-start space-y-0">
                  <CardTitle className="text-lg">{p.nome_completo}</CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive -mt-2 -mr-2 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Paciente</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o paciente {p.nome_completo}? Esta ação
                          ocultará o paciente da lista.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(p.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">{p.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4 shrink-0" />
                    {p.telefone || 'Não informado'}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-primary hover:text-primary/80"
                    onClick={() => navigate(`/patients/${p.id}/medical-record`)}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Abrir Prontuário
                  </Button>
                </CardContent>
              </Card>
            ))}
            {pacientes.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                Nenhum paciente cadastrado.
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="access">
          <PatientAccessList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
