import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, FileSignature } from 'lucide-react'
import { SellProtocolDialog } from '@/components/protocols/SellProtocolDialog'

export default function PrescriptionsList() {
  const [prescricoes, setPrescricoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPrescricoes() {
      const { data } = await supabase
        .from('prescricoes')
        .select('*, pacientes(nome_completo)')
        .order('created_at', { ascending: false })
      if (data) setPrescricoes(data)
      setLoading(false)
    }
    loadPrescricoes()
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
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Protocolos de Prescrição
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de prescrições ativas e histórico.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Nova Prescrição
          </Button>
          <SellProtocolDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prescricoes.map((prescricao) => (
          <Card key={prescricao.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-1">
                {prescricao.pacientes?.nome_completo || 'Paciente Desconhecido'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Gerada em: {new Date(prescricao.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    if (prescricao.arquivo_pdf_url) {
                      window.open(prescricao.arquivo_pdf_url, '_blank')
                    }
                  }}
                  disabled={!prescricao.arquivo_pdf_url}
                >
                  <FileSignature className="mr-2 h-4 w-4" />
                  Ver Prescrição Completa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {prescricoes.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhuma prescrição encontrada no sistema.
          </div>
        )}
      </div>
    </div>
  )
}
