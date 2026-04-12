import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, FileText } from 'lucide-react'
import { SellProtocolDialog } from '@/components/protocols/SellProtocolDialog'
import { Badge } from '@/components/ui/badge'

export default function BiochemicalExams() {
  const [exames, setExames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadExames() {
      const { data } = await supabase
        .from('exames')
        .select('*, pacientes(nome_completo)')
        .eq('tipo', 'bioquimico')
        .order('created_at', { ascending: false })
      if (data) setExames(data)
      setLoading(false)
    }
    loadExames()
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
          <h1 className="text-3xl font-bold text-primary tracking-tight">Exames Bioquímicos</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de exames laboratoriais e bioquímicos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Importar Exame
          </Button>
          <SellProtocolDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exames.map((exame) => (
          <Card key={exame.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-1">
                {exame.pacientes?.nome_completo || 'Paciente Desconhecido'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground flex justify-between items-center">
                <p>{new Date(exame.created_at).toLocaleDateString('pt-BR')}</p>
                <Badge variant={exame.status === 'pendente' ? 'outline' : 'default'}>
                  {exame.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" className="w-full" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {exames.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhum exame bioquímico cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}
