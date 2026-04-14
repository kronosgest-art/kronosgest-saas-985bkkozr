import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Coins, DollarSign, Clock, Search, FilterX, Eye, Send } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CreditPurchase {
  id: string
  created_at: string
  clinica_nome: string
  admin_email: string
  package_name: string
  credits_amount: number
  price: number
  status: string
  payment_method: string
}

const PACKAGES = [
  { name: '10 Créditos', credits: 10, price: 49.9, color: 'bg-blue-900' },
  { name: '25 Créditos', credits: 25, price: 99.9, color: 'bg-[#B8860B]', badge: 'MELHOR VALOR' },
  {
    name: '50 Créditos',
    credits: 50,
    price: 179.9,
    color: 'bg-emerald-500',
    badge: 'MELHOR VALOR',
  },
  {
    name: '100 Créditos',
    credits: 100,
    price: 299.9,
    color: 'bg-purple-600',
    badge: 'MELHOR VALOR',
  },
]

export default function Credits() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { toast } = useToast()

  const [purchases, setPurchases] = useState<CreditPurchase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [selectedPurchase, setSelectedPurchase] = useState<CreditPurchase | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isResendOpen, setIsResendOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user || user.user_metadata?.role !== 'admin') {
        navigate('/login')
        return
      }
      fetchPurchases()
    }
  }, [user, loading, navigate])

  const fetchPurchases = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.rpc('get_admin_credit_purchases')
    if (error) {
      toast({ title: 'Erro ao buscar compras', description: error.message, variant: 'destructive' })
    } else {
      setPurchases(data || [])
    }
    setIsLoading(false)
  }

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch =
        p.clinica_nome.toLowerCase().includes(search.toLowerCase()) ||
        p.admin_email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter

      let matchDate = true
      const pDate = new Date(p.created_at)
      if (dateFrom) matchDate = matchDate && pDate >= new Date(dateFrom)
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        matchDate = matchDate && pDate <= to
      }

      return matchSearch && matchStatus && matchDate
    })
  }, [purchases, search, statusFilter, dateFrom, dateTo])

  const kpis = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const thisMonthPurchases = purchases.filter((p) => {
      const d = new Date(p.created_at)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    return {
      totalCreditsSold: thisMonthPurchases.reduce(
        (acc, curr) => acc + (curr.status === 'paid' ? curr.credits_amount : 0),
        0,
      ),
      revenue: thisMonthPurchases.reduce(
        (acc, curr) => acc + (curr.status === 'paid' ? Number(curr.price) : 0),
        0,
      ),
      pending: purchases.reduce(
        (acc, curr) => acc + (curr.status === 'pending' ? Number(curr.price) : 0),
        0,
      ),
    }
  }, [purchases])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const handleResendReceipt = async () => {
    setIsResendOpen(false)
    toast({
      title: '✅ Recibo reenviado com sucesso',
      description: `O recibo foi enviado para ${selectedPurchase?.admin_email}`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500">Pago</Badge>
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            Pendente
          </Badge>
        )
      case 'failed':
        return <Badge variant="destructive">Falha</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Créditos Adicionais</h1>
          <p className="text-slate-500 mt-1">Gerencie a venda de pacotes de créditos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-900 rounded-lg">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Créditos Vendidos (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-800">{kpis.totalCreditsSold}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Receita (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(kpis.revenue)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Compras Pendentes</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(kpis.pending)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Pacotes Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {PACKAGES.map((pkg, i) => (
            <Card key={i} className="relative overflow-hidden border-0 shadow-md">
              <div className={`${pkg.color} h-2 w-full absolute top-0 left-0`}></div>
              <CardHeader className="pb-2 pt-6">
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-full ${pkg.color} text-white bg-opacity-10`}>
                    <Coins
                      className={`h-5 w-5 ${pkg.color.replace('bg-', 'text-').replace('text-[#B8860B]', 'text-yellow-600')}`}
                    />
                  </div>
                  {pkg.badge && (
                    <Badge variant="secondary" className="text-[10px] font-bold tracking-wider">
                      {pkg.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4 text-lg">{pkg.name}</CardTitle>
                <CardDescription>{formatCurrency(pkg.price)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 font-medium">
                  {formatCurrency(pkg.price / pkg.credits)} / crédito
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>
            Todas as transações de compra de créditos na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por clínica ou email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="failed">Falha</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[140px]"
              />
              <span className="text-slate-400">até</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[140px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setDateFrom('')
                setDateTo('')
              }}
            >
              <FilterX className="h-4 w-4 mr-2" /> Limpar
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Clínica / Email</TableHead>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-800">{p.clinica_nome}</p>
                        <p className="text-xs text-slate-500">{p.admin_email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{p.package_name}</p>
                        <p className="text-xs text-slate-500">{p.credits_amount} créditos</p>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(p.price)}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                            onClick={() => {
                              setSelectedPurchase(p)
                              setIsDetailsOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                            onClick={() => {
                              setSelectedPurchase(p)
                              setIsResendOpen(true)
                            }}
                          >
                            <Send className="h-4 w-4 mr-1" /> Recibo
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Compra</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Clínica</p>
                  <p className="font-medium">{selectedPurchase.clinica_nome}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{selectedPurchase.admin_email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pacote</p>
                  <p className="font-medium">{selectedPurchase.package_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Créditos</p>
                  <p className="font-medium">{selectedPurchase.credits_amount} un.</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Valor Pago</p>
                  <p className="font-medium">{formatCurrency(selectedPurchase.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedPurchase.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Data da Compra</p>
                  <p className="font-medium">
                    {format(new Date(selectedPurchase.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Método</p>
                  <p className="font-medium capitalize">
                    {selectedPurchase.payment_method || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resend Receipt Modal */}
      <Dialog open={isResendOpen} onOpenChange={setIsResendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reenviar Recibo</DialogTitle>
            <DialogDescription>
              Deseja reenviar o recibo desta compra para o email{' '}
              <strong>{selectedPurchase?.admin_email}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsResendOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleResendReceipt}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Confirmar Envio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
