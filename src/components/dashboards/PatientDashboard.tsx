import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList } from 'lucide-react'

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Minha Ficha Clínica</h1>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bem-vindo(a) ao seu painel</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg mt-2">
            Aqui você pode acompanhar seus exames, sessões e prescrições.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
