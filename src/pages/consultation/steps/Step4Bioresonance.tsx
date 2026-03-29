import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UploadCloud, FileText, Sparkles, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Step4Bioresonance() {
  const [uploaded, setUploaded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const handleUpload = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setUploaded(true)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Upload de Bioressonância</h2>
        <p className="text-muted-foreground">
          Envie o PDF para análise via Inteligência Artificial.
        </p>
      </div>

      {!uploaded ? (
        <div
          onClick={handleUpload}
          className="border-2 border-dashed border-primary/30 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 transition-colors"
        >
          {analyzing ? (
            <div className="space-y-4">
              <Sparkles className="h-12 w-12 text-secondary animate-pulse mx-auto" />
              <p className="text-lg font-medium">IA do Gemini analisando documento...</p>
            </div>
          ) : (
            <>
              <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Arraste o PDF ou clique para selecionar</h3>
              <p className="text-sm text-muted-foreground mt-1">Máximo 10MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-400">
                  relatorio_biorressonancia_joao.pdf
                </p>
                <p className="text-xs text-green-600/80">Analisado por IA com sucesso</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setUploaded(false)}>
              Remover
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Órgãos Alterados
                </h3>
                <ScrollArea className="h-[150px]">
                  <ul className="space-y-3">
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium">Fígado</span>
                      <Badge variant="destructive">Gordura Nível 2</Badge>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium">Intestino</span>
                      <Badge variant="outline" className="text-orange-500 border-orange-500">
                        Disbiose
                      </Badge>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Tireoide</span>
                      <Badge variant="secondary">Lentidão</Badge>
                    </li>
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4 text-secondary">
                  <Sparkles className="h-5 w-5" /> Recomendações IA
                </h3>
                <ScrollArea className="h-[150px]">
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Iniciar protocolo de Limpeza Hepática.</li>
                    <li>Suplementação de Coenzima Q10 (50mg).</li>
                    <li>Redução drástica de carboidratos refinados.</li>
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground border-l-4 border-secondary">
            <strong>Aviso Legal:</strong> A análise por IA é sugestiva e não substitui a avaliação
            clínica do profissional responsável.
          </div>
        </div>
      )}
    </div>
  )
}
