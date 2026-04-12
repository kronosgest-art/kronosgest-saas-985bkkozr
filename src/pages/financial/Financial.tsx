import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DollarSign, ArrowUpRight, Clock } from 'lucide-react'
import { toast } from 'sonner'

type Transacao = {
  id: string
  tipo: string
  categoria: string
  valor: number
  data_transacao: string
  status: string
  descricao: string
  pacientes?: { nome_completo: string }
}

export default function Financial() {
  const { user } = useAuth()
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchTransacoes()
  }, [user])

  const fetchTransacoes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select(`
          *,
          pacientes ( nome_completo )
        `)
        .order('data_transacao', { ascending: false })

      if (error) throw error
      setTransacoes(data || [])
    } catch (err: any) {
      toast.error('Erro ao carregar transações: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const totalReceitas = transacoes
    .filter((t) => ['receita', 'protocolo', 'sessao'].includes(t.tipo) && t.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor, 0)
  const totalPendentes = transacoes
    .filter((t) => t.status === 'pendente')
    .reduce((acc, curr) => acc + curr.valor, 0)

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[#1E3A8A]">Financeiro</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe suas receitas, vendas de protocolos e fluxo de caixa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1 text-green-500" />
              Receitas Pagas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalReceitas)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-1 text-amber-500" />
              Valores Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(totalPendentes)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1E3A8A] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-[#1E3A8A]" />
              Total Lançamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{transacoes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-[#1E3A8A]">Histórico de Transações</CardTitle>
          <CardDescription>Todas as vendas de protocolos e outros lançamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E3A8A] border-t-transparent" />
            </div>
          ) : transacoes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              Nenhuma transação encontrada.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Descrição / Paciente</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transacoes.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {format(new Date(t.data_transacao), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {t.descricao || 'Sem descrição'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t.pacientes?.nome_completo || 'Paciente não informado'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {t.categoria}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            t.status === 'pago'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                          }
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800 whitespace-nowrap">
                        {formatCurrency(t.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
