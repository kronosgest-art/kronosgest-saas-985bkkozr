import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Download, Plus } from 'lucide-react'

const salesData = [
  {
    id: '1023',
    client: 'João Silva',
    service: 'Sessão Completa',
    value: 'R$ 450',
    date: '10/10/2023',
    method: 'PIX',
    status: 'Pago',
  },
  {
    id: '1024',
    client: 'Maria Costa',
    service: 'Limpeza Hepática',
    value: 'R$ 800',
    date: '11/10/2023',
    method: 'Cartão',
    status: 'Pendente',
  },
  {
    id: '1025',
    client: 'Carlos Luz',
    service: 'Retorno',
    value: 'R$ 200',
    date: '12/10/2023',
    method: 'Boleto',
    status: 'Atrasado',
  },
]

const revenueByMethod = [
  { method: 'PIX', value: 15000 },
  { method: 'Cartão Crédito', value: 8500 },
  { method: 'Boleto', value: 2000 },
]

export default function Financial() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão Financeira</h1>
          <p className="text-muted-foreground mt-1">Acompanhe vendas, recebimentos e comissões.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar Relatório
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Venda
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendas">Vendas e Recebimentos</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões (Profissionais)</TabsTrigger>
          <TabsTrigger value="graficos">Visão Gráfica</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell className="font-medium">{s.client}</TableCell>
                      <TableCell>{s.service}</TableCell>
                      <TableCell>{s.value}</TableCell>
                      <TableCell>{s.date}</TableCell>
                      <TableCell>{s.method}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.status === 'Pago'
                              ? 'default'
                              : s.status === 'Pendente'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className={s.status === 'Pago' ? 'bg-green-600' : ''}
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graficos">
          <Card>
            <CardHeader>
              <CardTitle>Receita por Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{ value: { label: 'Receita', color: 'hsl(var(--primary))' } }}
                className="h-full w-full"
              >
                <BarChart
                  data={revenueByMethod}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
