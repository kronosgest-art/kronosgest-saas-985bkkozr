import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, UserPlus, DollarSign, Calendar, Plus, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const sessionsData = [
  { day: 'Seg', sessions: 8 },
  { day: 'Ter', sessions: 12 },
  { day: 'Qua', sessions: 10 },
  { day: 'Qui', sessions: 15 },
  { day: 'Sex', sessions: 14 },
  { day: 'Sab', sessions: 5 },
]

const patientStatusData = [
  { name: 'Ativos', value: 300 },
  { name: 'Inativos', value: 50 },
  { name: 'Pendentes', value: 20 },
]
const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(var(--secondary))']

const recentPatients = [
  {
    name: 'Ana Silva',
    cpf: '111.222.333-44',
    status: 'Ativo',
    last: '10/10/2023',
    next: '10/11/2023',
    rev: 'R$ 450',
  },
  {
    name: 'Carlos Santos',
    cpf: '555.666.777-88',
    status: 'Pendente',
    last: '15/09/2023',
    next: 'Agendar',
    rev: 'R$ 0',
  },
  {
    name: 'Mariana Costa',
    cpf: '999.000.111-22',
    status: 'Ativo',
    last: '01/10/2023',
    next: '01/11/2023',
    rev: 'R$ 900',
  },
]

const chartConfig = {
  sessions: { label: 'Sessões', color: 'hsl(var(--primary))' },
}

export default function ClinicDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard da Clínica
          </h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus pacientes e consultas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            className="shadow-lg shadow-primary/20"
            onClick={() => navigate('/consultation')}
          >
            <Plus className="mr-2 h-5 w-5" /> Novo Cliente
          </Button>
          <Button
            size="lg"
            className="bg-[#1E3A8A] hover:bg-[#152865] text-white shadow-lg"
            onClick={() => navigate('/premium-consultation')}
          >
            <Crown className="mr-2 h-5 w-5 text-[#B8860B]" /> Consulta Premium
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total de Pacientes', value: '370', icon: Users, trend: '+12 este mês' },
          { title: 'Novos Clientes (Mês)', value: '24', icon: UserPlus, trend: '+5% vs mês ant.' },
          {
            title: 'Receita Mensal',
            value: 'R$ 28.500',
            icon: DollarSign,
            trend: '+15% vs mês ant.',
          },
          { title: 'Próx. Consultas (7d)', value: '42', icon: Calendar, trend: 'Agenda cheia' },
        ].map((stat, i) => (
          <Card key={i} className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sessões Realizadas na Semana</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={sessionsData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Status dos Pacientes</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ChartContainer config={{}} className="h-full w-full max-h-[250px]">
              <PieChart>
                <Pie
                  data={patientStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {patientStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Consulta</TableHead>
                <TableHead>Próxima Consulta</TableHead>
                <TableHead>Receita Gerada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPatients.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.cpf}</TableCell>
                  <TableCell>
                    <Badge
                      variant={p.status === 'Ativo' ? 'default' : 'secondary'}
                      className={p.status === 'Ativo' ? 'bg-green-600' : ''}
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.last}</TableCell>
                  <TableCell>{p.next}</TableCell>
                  <TableCell>{p.rev}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
