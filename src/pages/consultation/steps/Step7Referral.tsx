import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Step7Referral() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-slide-in-right max-w-2xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Encaminhamento Médico</h2>
          <p className="text-muted-foreground">
            Necessário quando identificados riscos clínicos além da especialidade.
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="shrink-0 font-medium">
          🖨️ Imprimir
        </Button>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          A IA detectou alterações severas na Bioressonância (Fígado) que podem requerer avaliação
          de um Hepatologista.
        </AlertDescription>
      </Alert>

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label>Especialidade Solicitada</Label>
          <Input defaultValue="Hepatologia / Gastroenterologia" />
        </div>

        <div className="space-y-2">
          <Label>Motivo do Encaminhamento</Label>
          <Textarea
            defaultValue="Encaminho paciente para avaliação especializada devido a marcadores elevados indicativos de esteatose hepática severa observados em triagem."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Exames Sugeridos para o Médico</Label>
          <Textarea defaultValue="Ultrassonografia de abdome total, TGO, TGP, Gama GT." rows={3} />
        </div>
      </div>
    </div>
  )
}
