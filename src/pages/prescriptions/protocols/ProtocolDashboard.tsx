import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Activity } from 'lucide-react'
import { Protocol } from './use-protocols'

interface ProtocolDashboardProps {
  protocols: Protocol[]
}

export default function ProtocolDashboard({ protocols }: ProtocolDashboardProps) {
  const topProtocols = useMemo(() => {
    return [...protocols]
      .filter((p) => (p.vezes_prescrito || 0) > 0)
      .sort((a, b) => (b.vezes_prescrito || 0) - (a.vezes_prescrito || 0))
      .slice(0, 5)
  }, [protocols])

  if (topProtocols.length === 0) return null

  return (
    <Card className="border-primary/10 shadow-sm bg-white mb-6">
      <CardHeader className="pb-2 bg-primary/5 border-b border-primary/5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          <Activity className="w-4 h-4" /> Top 5 Protocolos Mais Utilizados
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 h-[200px]">
        <ChartContainer
          config={{ vezes: { label: 'Prescrições', color: 'hsl(var(--primary))' } }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProtocols} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="nome" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="vezes_prescrito" fill="var(--color-vezes)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
