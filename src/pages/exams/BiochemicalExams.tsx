import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, FileText, Trash2 } from 'lucide-react'
import { SellProtocolDialog } from '@/components/protocols/SellProtocolDialog'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function BiochemicalExams() {
  const { user } = useAuth()
  const isPatient = ['paciente', 'cliente', 'patient'].includes(user?.user_metadata?.role || '')
  const [exames, setExames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const renderJson = (json: any) => {
    if (!json) return null
    if (typeof json === 'string') return <p className="text-sm text-slate-700">{json}</p>

    if (
      json.valores_alterados ||
      json.interpretacao ||
      json.alerta ||
      json.alteracoes ||
      json.frequencias_criticas ||
      json.recomendacoes
    ) {
      return (
        <div className="space-y-4 text-sm">
          {json.valores_alterados && (
            <div>
              <strong className="block text-amber-800 mb-1">Valores Alterados:</strong>
              <ul className="list-disc pl-5 text-amber-700 space-y-1">
                {Array.isArray(json.valores_alterados) ? (
                  json.valores_alterados.map((v: string, i: number) => <li key={i}>{v}</li>)
                ) : (
                  <li>{json.valores_alterados}</li>
                )}
              </ul>
            </div>
          )}
          {json.alteracoes && (
            <div>
              <strong className="block text-amber-800 mb-1">Alterações:</strong>
              <ul className="list-disc pl-5 text-amber-700 space-y-1">
                {Array.isArray(json.alteracoes) ? (
                  json.alteracoes.map((v: string, i: number) => <li key={i}>{v}</li>)
                ) : (
                  <li>{json.alteracoes}</li>
                )}
              </ul>
            </div>
          )}
          {json.frequencias_criticas && (
            <div>
              <strong className="block text-red-800 mb-1">Frequências Críticas:</strong>
              <ul className="list-disc pl-5 text-red-700 space-y-1">
                {Array.isArray(json.frequencias_criticas) ? (
                  json.frequencias_criticas.map((v: string, i: number) => <li key={i}>{v}</li>)
                ) : (
                  <li>{json.frequencias_criticas}</li>
                )}
              </ul>
            </div>
          )}
          {json.recomendacoes && (
            <div>
              <strong className="block text-green-800 mb-1">Recomendações:</strong>
              <ul className="list-disc pl-5 text-green-700 space-y-1">
                {Array.isArray(json.recomendacoes) ? (
                  json.recomendacoes.map((v: string, i: number) => <li key={i}>{v}</li>)
                ) : (
                  <li>{json.recomendacoes}</li>
                )}
              </ul>
            </div>
          )}
          {json.interpretacao && (
            <div>
              <strong className="block text-slate-800 mb-1">Interpretação:</strong>
              <p className="text-slate-700 leading-relaxed">{json.interpretacao}</p>
            </div>
          )}
          {json.alerta && (
            <div>
              <strong className="block text-red-800 mb-1">Alerta:</strong>
              <p className="text-red-700 font-medium">{json.alerta}</p>
            </div>
          )}
        </div>
      )
    }

    return (
      <pre className="bg-slate-900 text-slate-50 p-4 rounded-md text-xs overflow-x-auto">
        {JSON.stringify(json, null, 2)}
      </pre>
    )
  }

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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este exame?')) return

    const { error } = await supabase.from('exames').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao apagar o exame')
      console.error(error)
    } else {
      toast.success('Exame apagado com sucesso')
      setExames(exames.filter((e) => e.id !== id))
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
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setSelectedItem(exame)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Button>
                {!isPatient && (
                  <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    size="sm"
                    onClick={() => handleDelete(exame.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Apagar
                  </Button>
                )}
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

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Exame Bioquímico</DialogTitle>
            <DialogDescription>
              {selectedItem?.pacientes?.nome_completo || 'Paciente Desconhecido'} -{' '}
              {selectedItem && new Date(selectedItem.created_at).toLocaleDateString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {selectedItem?.interpretacao_ia && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-blue-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Interpretação IA
                </h4>
                <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.interpretacao_ia}
                </div>
              </div>
            )}

            {selectedItem?.resultado_json && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-slate-800">Dados Extraídos</h4>
                <div className="bg-slate-50 p-4 rounded-md border">
                  {renderJson(selectedItem.resultado_json)}
                </div>
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
                    <FileText className="mr-2 h-4 w-4" /> Abrir Documento Original (PDF)
                  </a>
                </Button>
              </div>
            )}

            {!selectedItem?.resultado_json &&
              !selectedItem?.interpretacao_ia &&
              !selectedItem?.arquivo_pdf_url && (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Nenhum detalhe disponível para este exame.
                </p>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
