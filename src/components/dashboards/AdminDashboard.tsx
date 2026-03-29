import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Activity, Users, DollarSign, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const revData = [
  { month: 'Jan', rev: 120000 },
  { month: 'Fev', rev: 150000 },
  { month: 'Mar', rev: 180000 },
  { month: 'Abr', rev: 220000 },
  { month: 'Mai', rev: 250000 },
  { month: 'Jun', rev: 290000 },
]

const countryData = [
  { country: 'Brasil', clinics: 145 },
  { country: 'Portugal', clinics: 32 },
  { country: 'EUA', clinics: 12 },
]

const clinics = [
  {
    name: 'Clínica Saúde Plena',
    cnpj: '12.345.678/0001-90',
    plan: 'Pro',
    rev: 'R$ 45.000',
    clients: 320,
    status: 'Ativo',
  },
  {
    name: 'Bem Estar Med',
    cnpj: '98.765.432/0001-10',
    plan: 'Enterprise',
    rev: 'R$ 120.000',
    clients: 850,
    status: 'Ativo',
  },
  {
    name: 'Vita Fisio',
    cnpj: '45.123.890/0001-55',
    plan: 'Starter',
    rev: 'R$ 15.000',
    clients: 85,
    status: 'Pendente',
  },
]

const chartConfig = {
  rev: { label: 'Receita', color: 'hsl(var(--primary))' },
  clinics: { label: 'Clínicas', color: 'hsl(var(--secondary))' },
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Global</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema KronosGest.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Clínicas Ativas', value: '189', icon: Activity, trend: '+12% este mês' },
          { title: 'Pacientes Globais', value: '12.450', icon: Users, trend: '+8% este mês' },
          { title: 'Receita Total', value: 'R$ 1.2M', icon: DollarSign, trend: '+15% este mês' },
          { title: 'Taxa de Conversão', value: '64%', icon: Target, trend: '+2% este mês' },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
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
            <CardTitle>Receita ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={revData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(val) => `R$${val / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="rev"
                  stroke="var(--color-rev)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Clínicas por País</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={countryData}
                layout="vertical"
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis dataKey="country" type="category" axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="clinics" fill="var(--color-clinics)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diretório de Clínicas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Receita Mensal</TableHead>
                <TableHead>Clientes Ativos</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.cnpj}</TableCell>
                  <TableCell>{c.plan}</TableCell>
                  <TableCell>{c.rev}</TableCell>
                  <TableCell>{c.clients}</TableCell>
                  <TableCell>
                    <Badge
                      variant={c.status === 'Ativo' ? 'default' : 'secondary'}
                      className={c.status === 'Ativo' ? 'bg-green-600' : ''}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
