import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Users, FileText, DollarSign, Calendar } from 'lucide-react'
import { SellProtocolDialog } from '@/components/protocols/SellProtocolDialog'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    prescriptions: 0,
    revenue: 0,
    appointments: 0,
  })

  useEffect(() => {
    async function loadStats() {
      const [
        { count: patientsCount },
        { count: prescCount },
        { data: transactions },
        { count: apptCount },
      ] = await Promise.all([
        supabase.from('pacientes').select('*', { count: 'exact', head: true }),
        supabase.from('prescricoes').select('*', { count: 'exact', head: true }),
        supabase
          .from('transacoes_financeiras')
          .select('valor')
          .eq('tipo', 'receita')
          .eq('status', 'pago'),
        supabase.from('agendamentos').select('*', { count: 'exact', head: true }),
      ])

      const totalRevenue =
        transactions?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0

      setStats({
        patients: patientsCount || 0,
        prescriptions: prescCount || 0,
        revenue: totalRevenue,
        appointments: apptCount || 0,
      })
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Dashboard Principal</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo(a) ao seu painel de controle KronosGest.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SellProtocolDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patients}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescrições Geradas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prescriptions}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.revenue,
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
