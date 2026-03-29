import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Printer, FileDown, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Step6Prescription() {
  const aiSuggestion = `Fórmula SBPC/ML sugerida:
1. Vitamina D3 - 10.000 UI (1 cap/dia no almoço)
2. Magnésio Dimalato - 250mg (1 cap/noite)
3. Coenzima Q10 - 100mg (1 cap/dia)

Orientações:
- Tomar com água abundante.
- Evitar laticínios 1h após a Vitamina D3.`

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Prescrição</h2>
          <p className="text-muted-foreground">Fórmulas e recomendações ao paciente.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="secondary">
            <FileDown className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-secondary/50 bg-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-secondary-foreground font-bold">
              <Sparkles className="mr-2 h-4 w-4" /> Sugestão da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs whitespace-pre-wrap">{aiSuggestion}</p>
            <Button
              size="sm"
              className="w-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Copiar para Receituário
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Receituário Principal</label>
            <Textarea
              className="min-h-[300px] font-mono p-4"
              placeholder="Descreva aqui os compostos, dosagens, frequência e anotações..."
              defaultValue="RECEITUÁRIO&#10;&#10;Paciente: João da Silva&#10;Data: 10/10/2023&#10;&#10;Uso Oral:&#10;"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
