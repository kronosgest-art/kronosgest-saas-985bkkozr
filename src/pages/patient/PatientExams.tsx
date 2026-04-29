import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PatientExams() {
  const { user } = useAuth()
  const [exames, setExames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return

      const { data: patient } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (patient) {
        const { data } = await supabase
          .from('exames')
          .select('*')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
        if (data) setExames(data)
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Meus Exames</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exames.map((exame) => (
          <Card key={exame.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg capitalize">{exame.tipo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground flex justify-between items-center">
                <p>{new Date(exame.created_at).toLocaleDateString('pt-BR')}</p>
                <Badge variant={exame.status === 'pendente' ? 'outline' : 'default'}>
                  {exame.status}
                </Badge>
              </div>
              <Button
                variant="outline"
                className="w-full mt-2"
                size="sm"
                onClick={() => {
                  if (exame.arquivo_pdf_url) window.open(exame.arquivo_pdf_url, '_blank')
                  else if (exame.interpretacao_ia) alert(exame.interpretacao_ia)
                  else if (exame.resultado_json)
                    alert(JSON.stringify(exame.resultado_json, null, 2))
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Ver Resultado
              </Button>
            </CardContent>
          </Card>
        ))}
        {exames.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhum exame encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
