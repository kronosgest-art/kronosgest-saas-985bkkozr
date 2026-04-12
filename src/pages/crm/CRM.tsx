import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, Inbox } from 'lucide-react'

export default function CRM() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">CRM & Leads</h1>
        <p className="text-muted-foreground mt-1">Acompanhamento e captação de novos clientes.</p>
      </div>
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Caixa de Entrada de Leads</CardTitle>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="h-12 w-12 text-muted/50 mb-4" />
          <div className="text-lg font-medium text-muted-foreground">
            O Gerenciamento avançado de Leads será habilitado em breve.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
