import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, FileSignature } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function PatientPrescriptions() {
  const { user } = useAuth()
  const [prescricoes, setPrescricoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)

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
          .from('prescricoes')
          .select('*')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
        if (data) setPrescricoes(data)
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
      <h1 className="text-3xl font-bold text-primary tracking-tight">Minhas Prescrições</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prescricoes.map((p) => (
          <Card key={p.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prescrição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Data: {new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <Button
                variant="outline"
                className="w-full mt-2"
                size="sm"
                onClick={() => setSelectedItem(p)}
              >
                <FileSignature className="mr-2 h-4 w-4" />
                Ver Prescrição Completa
              </Button>
            </CardContent>
          </Card>
        ))}
        {prescricoes.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhuma prescrição encontrada.
          </div>
        )}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Minha Prescrição</DialogTitle>
            <DialogDescription>
              Gerada em:{' '}
              {selectedItem && new Date(selectedItem.created_at).toLocaleDateString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedItem?.conteudo_json?.prescricao && (
              <div>
                <h4 className="font-semibold text-sm text-slate-800">Fórmula/Medicação</h4>
                <p className="whitespace-pre-wrap bg-slate-50 p-3 rounded-md text-sm text-slate-700 mt-1">
                  {selectedItem.conteudo_json.prescricao}
                </p>
              </div>
            )}
            {selectedItem?.conteudo_json?.posologia && (
              <div>
                <h4 className="font-semibold text-sm text-slate-800">Posologia</h4>
                <p className="whitespace-pre-wrap bg-slate-50 p-3 rounded-md text-sm text-slate-700 mt-1">
                  {selectedItem.conteudo_json.posologia}
                </p>
              </div>
            )}
            {selectedItem?.conteudo_json?.avisos &&
              Array.isArray(selectedItem.conteudo_json.avisos) &&
              selectedItem.conteudo_json.avisos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-amber-900">Orientações/Avisos</h4>
                  <ul className="list-disc pl-5 space-y-1 bg-amber-50 text-amber-800 p-3 rounded-md text-sm mt-1">
                    {selectedItem.conteudo_json.avisos.map((aviso: string, i: number) => (
                      <li key={i}>{aviso}</li>
                    ))}
                  </ul>
                </div>
              )}
            {selectedItem?.arquivo_pdf_url && (
              <div className="pt-4 border-t">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/5"
                >
                  <a href={selectedItem.arquivo_pdf_url} target="_blank" rel="noopener noreferrer">
                    <FileSignature className="mr-2 h-4 w-4" /> Abrir Receituário Original (PDF)
                  </a>
                </Button>
              </div>
            )}
            {!selectedItem?.conteudo_json && !selectedItem?.arquivo_pdf_url && (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhum detalhe disponível para esta prescrição.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
