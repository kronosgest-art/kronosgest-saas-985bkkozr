import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  BarChart3,
  Clock,
  DollarSign,
  Download,
  Eye,
  Mail,
  CheckCircle,
  Search,
  X,
} from 'lucide-react'
import { format, isSameMonth, parseISO } from 'date-fns'

interface BillingRecord {
  payment_id: string
  created_at: string
  clinica_nome: string
  email: string
  plan: string
  amount: number
  status: string
  method: string
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
const formatDate = (date: string) => format(parseISO(date), 'dd/MM/yyyy')
const normalizeStatus = (status: string) => {
  const s = status?.toLowerCase() || ''
  if (s === 'succeeded' || s === 'pago') return 'Pago'
  if (s === 'failed' || s === 'falha') return 'Falha'
  return 'Pendente'
}

export default function Billing() {
  const { user, loading: authLoading } = useAuth()
  const isAdmin =
    user?.email === 'dra.morganavieira@gmail.com' ||
    user?.user_metadata?.role === 'admin' ||
    user?.user_metadata?.is_admin === true

  const [records, setRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [planFilter, setPlanFilter] = useState('Todos')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [page, setPage] = useState(1)

  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null)
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false)
  const [resendOpen, setResendOpen] = useState(false)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase.rpc('get_admin_billing' as any)
    if (data) setRecords(data as BillingRecord[])
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) fetchData()
  }, [isAdmin])

  if (authLoading || loading)
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
    )
  if (!isAdmin) return <Navigate to="/login" replace />

  const currentMonthRecords = records.filter((r) => isSameMonth(parseISO(r.created_at), new Date()))
  const totalTransacoes = currentMonthRecords.length
  const receitaConfirmada = currentMonthRecords
    .filter((r) => normalizeStatus(r.status) === 'Pago')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)
  const transacoesPendentes = records
    .filter((r) => normalizeStatus(r.status) === 'Pendente')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      r.clinica_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'Todos' || normalizeStatus(r.status) === statusFilter
    const matchPlan = planFilter === 'Todos' || r.plan === planFilter
    const matchStart = !dateStart || new Date(r.created_at) >= new Date(dateStart)
    const matchEnd = !dateEnd || new Date(r.created_at) <= new Date(dateEnd)
    return matchSearch && matchStatus && matchPlan && matchStart && matchEnd
  })

  const itemsPerPage = 10
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage))
  const paginatedRecords = filteredRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const exportCSV = () => {
    const headers = ['Data', 'Clínica', 'Email', 'Plano', 'Valor', 'Status', 'Método']
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(
        (r) =>
          `"${formatDate(r.created_at)}","${r.clinica_nome}","${r.email}","${r.plan}","${r.amount}","${normalizeStatus(r.status)}","${r.method || 'Cartão'}"`,
      ),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `faturamento_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleMarkPaid = async () => {
    if (!selectedRecord) return
    const { error } = await supabase.rpc('admin_update_payment_status' as any, {
      p_payment_id: selectedRecord.payment_id,
      p_status: 'Pago',
    })

    await supabase.from('admin_audit_logs').insert({
      admin_id: user?.id,
      action: 'mark_payment_paid',
      details: { payment_id: selectedRecord.payment_id },
    })

    if (!error) {
      toast.success('Transação marcada como paga com sucesso!')
      fetchData()
    } else {
      toast.error('Erro ao atualizar status.')
    }
    setMarkPaidOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#001F3F]">
          Faturamento & Pagamentos
        </h1>
        <Button
          onClick={exportCSV}
          variant="outline"
          className="border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-white"
        >
          <Download className="mr-2 h-4 w-4" /> Exportar Relatório
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm border-[#333333]/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Transações (Este Mês)
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-[#001F3F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#001F3F]">{totalTransacoes}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-[#333333]/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Confirmada (Este Mês)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#C5A059]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#001F3F]">
              {formatCurrency(receitaConfirmada)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-[#333333]/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transações Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#001F3F]">
              {formatCurrency(transacoesPendentes)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm border-[#333333]/10">
        <CardContent className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Clínica ou Email"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Falha">Falha</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Plano</label>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Profissional">Profissional</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data (Opcional)</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full"
              />
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('Todos')
              setPlanFilter('Todos')
              setDateStart('')
              setDateEnd('')
              setPage(1)
            }}
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <X className="mr-2 h-4 w-4" /> Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#001F3F]/5 text-[#001F3F]">
              <tr>
                <th className="h-12 px-4 font-semibold">Data</th>
                <th className="h-12 px-4 font-semibold">Clínica</th>
                <th className="h-12 px-4 font-semibold">Email</th>
                <th className="h-12 px-4 font-semibold">Plano</th>
                <th className="h-12 px-4 font-semibold">Valor</th>
                <th className="h-12 px-4 font-semibold">Status</th>
                <th className="h-12 px-4 font-semibold">Método</th>
                <th className="h-12 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-muted-foreground">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const status = normalizeStatus(record.status)
                  return (
                    <tr
                      key={record.payment_id}
                      className="border-t hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">{formatDate(record.created_at)}</td>
                      <td className="p-4 font-medium">{record.clinica_nome}</td>
                      <td className="p-4 text-muted-foreground">{record.email}</td>
                      <td className="p-4">{record.plan}</td>
                      <td className="p-4 font-medium">{formatCurrency(record.amount)}</td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={
                            status === 'Pago'
                              ? 'border-green-500 text-green-600 bg-green-50'
                              : status === 'Falha'
                                ? 'border-red-500 text-red-600 bg-red-50'
                                : 'border-amber-500 text-amber-600 bg-amber-50'
                          }
                        >
                          {status}
                        </Badge>
                      </td>
                      <td className="p-4">{record.method || 'Cartão'}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Ver Fatura"
                            onClick={() => {
                              setSelectedRecord(record)
                              setViewInvoiceOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            title="Reenviar Fatura"
                            onClick={() => {
                              setSelectedRecord(record)
                              setResendOpen(true)
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {status === 'Pendente' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Marcar como Pago"
                              onClick={() => {
                                setSelectedRecord(record)
                                setMarkPaidOpen(true)
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={viewInvoiceOpen} onOpenChange={setViewInvoiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fatura #{selectedRecord?.payment_id?.split('-')[0]}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-muted-foreground block">Data de Emissão</span>
                  {formatDate(selectedRecord.created_at)}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block">
                    Data de Vencimento
                  </span>
                  {formatDate(selectedRecord.created_at)}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block">Clínica</span>
                  {selectedRecord.clinica_nome}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block">Plano</span>
                  {selectedRecord.plan}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block">Valor</span>
                  {formatCurrency(selectedRecord.amount)}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block">Método</span>
                  {selectedRecord.method || 'Cartão'}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block">Status</span>
                  {normalizeStatus(selectedRecord.status)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewInvoiceOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => toast.success('Download iniciado...')}
              className="bg-[#001F3F] hover:bg-[#001F3F]/90 text-white"
            >
              <Download className="mr-2 h-4 w-4" /> Baixar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resendOpen} onOpenChange={setResendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reenviar Fatura</DialogTitle>
            <DialogDescription>
              Deseja enviar a fatura novamente para o email <strong>{selectedRecord?.email}</strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResendOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                toast.success('✅ Fatura reenviada com sucesso')
                setResendOpen(false)
              }}
              className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white"
            >
              Reenviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Pago</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja marcar esta transação de{' '}
              <strong>{selectedRecord?.clinica_nome}</strong> como paga?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMarkPaid} className="bg-green-600 hover:bg-green-700 text-white">
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
