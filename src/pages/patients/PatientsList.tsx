import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Loader2, Phone, Mail, FileText } from 'lucide-react'
import { CreatePatientDialog } from './CreatePatientDialog'

export default function PatientsList() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPacientes() {
    setLoading(true)
    const { data } = await supabase.from('pacientes').select('*').order('nome_completo')
    if (data) setPacientes(data)
    setLoading(false)
  }

  useEffect(() => {
    loadPacientes()
  }, [])

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
        <CreatePatientDialog onCreated={loadPacientes} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pacientes.map((p) => (
          <Card key={p.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 border-b mb-4">
              <CardTitle className="text-lg">{p.nome_completo}</CardTitle>
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
    </div>
  )
}
