import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DollarSign, TrendingUp, TrendingDown, Trash2, Search, Info } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Financial() {
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadFinances = async () => {
    setLoading(true)
    setError(false)
    const { data, error: err } = await supabase
      .from('transacoes_financeiras')
      .select('*, pacientes(nome_completo), protocolos(nome)')
      .order('data_transacao', { ascending: false })
    if (err) {
      setError(true)
    } else if (data) {
      setTransacoes(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFinances()
  }, [])

  const handleDelete = async () => {
    if (!transactionToDelete) return
    const { error } = await supabase
      .from('transacoes_financeiras')
      .delete()
      .eq('id', transactionToDelete)
    if (error) toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Transação excluída com sucesso.' })
      setTransactionToDelete(null)
      loadFinances()
    }
  }

  const filteredTransacoes = transacoes.filter((t) => {
    const matchTab = activeTab === 'all' || t.tipo === activeTab
    const matchSearch =
      debouncedSearch === '' ||
      (t.descricao || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (t.pacientes?.nome_completo || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      String(t.valor).includes(debouncedSearch)
    return matchTab && matchSearch
  })

  const receitas = transacoes
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)
  const despesas = transacoes
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)
  const saldo = receitas - despesas

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    )

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
          <p className="text-muted-foreground mt-1">Acompanhamento de fluxo de caixa.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#C5A059]" />
          <Input
            placeholder="Buscar transação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 focus-visible:ring-[#C5A059] border-[#C5A059] placeholder:text-[#333333]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm bg-[#FDFCF0] border border-[#C5A059]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#333333]">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-[#C5A059]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#001F3F]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-[#FDFCF0] border border-[#C5A059]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#333333]">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                receitas,
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-[#FDFCF0] border border-[#C5A059]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#333333]">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
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
        <CardHeader className="pb-2">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#C5A059] data-[state=active]:text-[#C5A059] text-[#333333] rounded-none py-2 bg-transparent"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger
                value="receita"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#C5A059] data-[state=active]:text-[#C5A059] text-[#333333] rounded-none py-2 bg-transparent"
              >
                Receitas (Entradas)
              </TabsTrigger>
              <TabsTrigger
                value="despesa"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#C5A059] data-[state=active]:text-[#C5A059] text-[#333333] rounded-none py-2 bg-transparent"
              >
                Despesas (Saídas)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-4">
            {filteredTransacoes.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-[#001F3F]">{t.descricao || 'Transação'}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.pacientes?.nome_completo || 'Sem Paciente'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(t.data_transacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`font-bold ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {t.tipo === 'receita' ? '+' : '-'}{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(t.valor)}
                    </span>
                    <Badge
                      variant={t.status === 'pago' ? 'default' : 'secondary'}
                      className={t.status === 'pago' ? 'bg-green-600' : ''}
                    >
                      {t.status.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTransactionToDelete(t.id)}
                    className="text-[#C5A059] hover:bg-[#FDFCF0] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredTransacoes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg border-dashed">
                <Info className="h-10 w-10 mb-2 opacity-50" />
                <p className="mb-4">Nenhum registro encontrado</p>
                <Button
                  variant="outline"
                  className="text-[#C5A059] border-[#C5A059] hover:bg-[#FDFCF0]"
                >
                  <Plus className="mr-2 h-4 w-4" /> Criar Novo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={(o) => !o && setTransactionToDelete(null)}
      >
        <AlertDialogContent className="bg-[#333333] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C5A059]">Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza que deseja excluir esta transação?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-gray-300 hover:bg-gray-800 border-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
