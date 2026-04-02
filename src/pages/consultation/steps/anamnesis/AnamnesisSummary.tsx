import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSectionIcon, shouldShowQuestion } from './utils'

interface AnamnesisSummaryProps {
  sections: any[]
  answers: any
  onEdit: (idx: number) => void
}

export function AnamnesisSummary({ sections, answers, onEdit }: AnamnesisSummaryProps) {
  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-primary">Resumo da Anamnese</h3>
        <p className="text-muted-foreground mt-2">
          Revise os dados informados antes de concluir e salvar definitivamente.
        </p>
      </div>

      {sections.map((sec, sIdx) => (
        <Card key={sec.id} className="overflow-hidden border-border/50 shadow-sm">
          <CardHeader className="bg-muted/30 py-4 flex flex-row items-center justify-between border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-3 text-primary">
              {getSectionIcon(sec.titulo)}
              {sec.titulo}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => onEdit(sIdx)}>
              Editar
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {sec.perguntas.map((q: any, qIdx: number) => {
                if (!shouldShowQuestion(q, qIdx, sec.perguntas, answers)) return null
                const ans = answers[q.id]
                const display = Array.isArray(ans)
                  ? ans.length > 0
                    ? ans.join(', ')
                    : '-'
                  : ans || '-'
                return (
                  <div
                    key={q.id}
                    className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 hover:bg-muted/10 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground font-medium pr-4">
                      {q.titulo}
                    </span>
                    <span className="text-sm sm:col-span-2 font-medium text-foreground">
                      {display}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
