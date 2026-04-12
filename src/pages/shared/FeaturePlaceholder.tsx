import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FeaturePlaceholder({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary tracking-tight">{title}</h1>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Em Breve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta funcionalidade está em desenvolvimento e estará disponível na próxima atualização
            do sistema KronosGest.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
