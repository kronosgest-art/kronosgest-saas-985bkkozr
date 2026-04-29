import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, TrendingDown, TrendingUp, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ReceitasList from './ReceitasList'
import DespesasList from './DespesasList'

export default function Financial() {
  const { user } = useAuth()
  const [receitas, setReceitas] = useState<any[]>([])
  const [despesas, setDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeTab, setActiveTab] = useState('receitas')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadFinances = async () => {
    if (!user) return
    setLoading(true)
    setError(false)
    const [resReceitas, resDespesas] = await Promise.all([
      supabase
        .from('receitas')
        .select('*, protocolos(nome)')
        .order('data_receita', { ascending: false }),
      supabase.from('despesas').select('*').order('data_despesa', { ascending: false }),
    ])

    if (resReceitas.error || resDespesas.error) {
      setError(true)
    } else {
      setReceitas(resReceitas.data || [])
      setDespesas(resDespesas.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFinances()
  }, [user])

  const totalReceitas = receitas.reduce((acc, r) => acc + Number(r.valor), 0)
  const totalDespesas = despesas.reduce((acc, d) => acc + Number(d.valor), 0)
  const saldoConsolidado = totalReceitas - totalDespesas

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-500 mb-4 font-medium">Erro ao carregar o financeiro.</p>
        <Button onClick={loadFinances} className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F] tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Gestão consolidada de Receitas e Despesas.</p>
        </div>
      </div>

      <div className="bg-[#FDFCF0] border border-[#C5A059] rounded-lg p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold text-[#001F3F] mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#C5A059]" /> Saldo Consolidado
        </h2>
        <div
          className={cn(
            'text-4xl font-bold tracking-tight',
            saldoConsolidado >= 0 ? 'text-green-600' : 'text-red-600',
          )}
        >
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            saldoConsolidado,
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card className="bg-[#FDFCF0] border-[#C5A059] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#001F3F]">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#C5A059]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C5A059]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalReceitas,
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#FDFCF0] border-[#C5A059] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#001F3F]">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalDespesas,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="bg-transparent border-b rounded-none justify-start h-auto p-0 gap-4 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger
              value="receitas"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#C5A059] data-[state=active]:text-[#C5A059] text-muted-foreground rounded-none py-2 bg-transparent"
            >
              Receitas (Entradas)
            </TabsTrigger>
            <TabsTrigger
              value="despesas"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#C5A059] data-[state=active]:text-[#C5A059] text-muted-foreground rounded-none py-2 bg-transparent"
            >
              Despesas (Saídas)
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#C5A059]" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-[#C5A059] focus-visible:ring-[#C5A059] placeholder:text-gray-500"
            />
          </div>
        </div>

        <TabsContent value="receitas" className="mt-0">
          <ReceitasList receitas={receitas} search={debouncedSearch} onReload={loadFinances} />
        </TabsContent>

        <TabsContent value="despesas" className="mt-0">
          <DespesasList despesas={despesas} search={debouncedSearch} onReload={loadFinances} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
