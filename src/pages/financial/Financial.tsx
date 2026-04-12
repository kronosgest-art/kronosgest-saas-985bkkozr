import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

export default function Financial() {
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFinances() {
      const { data } = await supabase
        .from('transacoes_financeiras')
        .select('*, pacientes(nome_completo), protocolos(nome)')
        .order('data_transacao', { ascending: false })
      if (data) setTransacoes(data)
      setLoading(false)
    }
    loadFinances()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const receitas = transacoes
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)
  const despesas = transacoes
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)
  const saldo = receitas - despesas

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhamento de vendas de protocolos, sessões e fluxo de caixa.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Consolidado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Entradas)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                receitas,
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Saídas)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                despesas,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de Transações Integrado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transacoes.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-semibold">{t.descricao || 'Transação'}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.pacientes?.nome_completo || 'Sem Paciente'}{' '}
                    {t.protocolos?.nome && `• ${t.protocolos.nome}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(t.data_transacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`font-bold text-lg ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {t.tipo === 'receita' ? '+' : '-'}{' '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      t.valor,
                    )}
                  </span>
                  <Badge
                    variant={t.status === 'pago' ? 'default' : 'secondary'}
                    className={t.status === 'pago' ? 'bg-green-600' : ''}
                  >
                    {t.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
            {transacoes.length === 0 && (
              <p className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                Nenhuma transação encontrada. As vendas de protocolos e sessões aparecerão aqui.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
