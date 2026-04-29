import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, FileSignature } from 'lucide-react'
import { SellProtocolDialog } from '@/components/protocols/SellProtocolDialog'
import { CreatePrescriptionDialog } from './CreatePrescriptionDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function PrescriptionsList() {
  const [prescricoes, setPrescricoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  async function loadPrescricoes() {
    setLoading(true)
    const { data } = await supabase
      .from('prescricoes')
      .select('*, pacientes(nome_completo)')
      .order('created_at', { ascending: false })
    if (data) setPrescricoes(data)
    setLoading(false)
  }

  useEffect(() => {
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
          <CreatePrescriptionDialog onCreated={loadPrescricoes} />
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
                  onClick={() => setSelectedItem(prescricao)}
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

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Prescrição</DialogTitle>
            <DialogDescription>
              {selectedItem?.pacientes?.nome_completo || 'Paciente Desconhecido'} -{' '}
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
                    <FileSignature className="mr-2 h-4 w-4" /> Abrir PDF Original
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
