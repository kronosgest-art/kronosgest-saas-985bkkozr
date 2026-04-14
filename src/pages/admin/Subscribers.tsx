import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Search,
  Edit,
  Ban,
  XCircle,
  RotateCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Subscriber {
  subscription_id: string
  user_id: string
  clinica_nome: string
  email: string
  plan: string
  status: string
  created_at: string
  trial_end_date: string
  free_access_end_date: string
}

interface Payment {
  id: string
  amount: number
  status: string
  created_at: string
}

export default function Subscribers() {
  const { user, loading } = useAuth()
  const isAdmin =
    user?.email === 'dra.morganavieira@gmail.com' ||
    user?.user_metadata?.role === 'admin' ||
    user?.user_metadata?.is_admin === true

  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubs, setFilteredSubs] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [planFilter, setPlanFilter] = useState('Todos')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modals state
  const [selectedSub, setSelectedSub] = useState<Subscriber | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [renewModalOpen, setRenewModalOpen] = useState(false)

  // Action states
  const [newPlan, setNewPlan] = useState('Básico')
  const [cancelReason, setCancelReason] = useState('')
  const [renewMonths, setRenewMonths] = useState('1')
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchSubscribers()
    }
  }, [loading, isAdmin])

  useEffect(() => {
    applyFilters()
  }, [subscribers, searchTerm, statusFilter, planFilter])

  const fetchSubscribers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.rpc('get_all_subscribers')
    if (data) {
      setSubscribers(data)
    } else if (error) {
      toast.error('Erro ao buscar assinantes: ' + error.message)
    }
    setIsLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...subscribers]

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.clinica_nome?.toLowerCase().includes(lower) || s.email?.toLowerCase().includes(lower),
      )
    }

    if (statusFilter !== 'Todos') {
      const dbStatus = mapStatusToDb(statusFilter)
      filtered = filtered.filter((s) => s.status === dbStatus)
    }

    if (planFilter !== 'Todos') {
      filtered = filtered.filter((s) => s.plan?.toLowerCase() === planFilter.toLowerCase())
    }

    setFilteredSubs(filtered)
    setCurrentPage(1)
  }

  const mapStatusToDb = (status: string) => {
    const map: Record<string, string> = {
      Ativo: 'active',
      Suspenso: 'suspended',
      Bloqueado: 'blocked',
      Trial: 'trial',
      'Acesso Gratuito': 'free_access',
    }
    return map[status] || status
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('Todos')
    setPlanFilter('Todos')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
  }

  const getRenewalDate = (sub: Subscriber) => {
    if (sub.status === 'trial' && sub.trial_end_date) return formatDate(sub.trial_end_date)
    if (sub.free_access_end_date) return formatDate(sub.free_access_end_date)
    return 'N/A'
  }

  const openDetails = async (sub: Subscriber) => {
    setSelectedSub(sub)
    const { data } = await supabase
      .from('payments')
      .select('id, amount, status, created_at')
      .eq('user_id', sub.user_id)
      .order('created_at', { ascending: false })
      .limit(3)
    setRecentPayments(data || [])
    setDetailsModalOpen(true)
  }

  const executeUpdate = async (params: any) => {
    const { error } = await supabase.rpc('admin_update_subscription_full', params)
    if (error) {
      toast.error(`Erro: ${error.message}`)
      return false
    }
    return true
  }

  const handleEditPlan = async () => {
    if (!selectedSub) return
    const success = await executeUpdate({
      p_subscription_id: selectedSub.subscription_id,
      p_plan: newPlan,
    })
    if (success) {
      toast.success('Plano atualizado com sucesso!')
      toast.info('E-mail enviado: Seu plano foi alterado.')
      setPlanModalOpen(false)
      fetchSubscribers()
    }
  }

  const handleSuspend = async () => {
    if (!selectedSub) return
    const success = await executeUpdate({
      p_subscription_id: selectedSub.subscription_id,
      p_status: 'suspended',
    })
    if (success) {
      toast.success('Assinatura suspensa!')
      toast.info(
        'E-mail enviado: ⏰ Seu acesso será bloqueado em 2 dias. Faça upgrade para continuar',
      )
      setSuspendModalOpen(false)
      fetchSubscribers()
    }
  }

  const handleCancel = async () => {
    if (!selectedSub) return
    const success = await executeUpdate({
      p_subscription_id: selectedSub.subscription_id,
      p_status: 'blocked',
      p_blocked_reason: cancelReason,
    })
    if (success) {
      toast.success('Assinatura cancelada!')
      toast.info('E-mail enviado: ❌ Sua assinatura foi cancelada')
      setCancelModalOpen(false)
      setCancelReason('')
      fetchSubscribers()
    }
  }

  const handleRenew = async () => {
    if (!selectedSub) return
    const success = await executeUpdate({
      p_subscription_id: selectedSub.subscription_id,
      p_add_months: parseInt(renewMonths, 10),
    })
    if (success) {
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'Renovação Manual',
        details: { subscription_id: selectedSub.subscription_id, months: renewMonths },
      })
      toast.success('Renovação realizada com sucesso!')
      setRenewModalOpen(false)
      fetchSubscribers()
    }
  }

  if (loading) return null
  if (!isAdmin) return <Navigate to="/login" replace />

  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage) || 1
  const paginatedSubs = filteredSubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
      case 'suspended':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Suspenso</Badge>
      case 'blocked':
        return <Badge className="bg-red-500 hover:bg-red-600">Bloqueado</Badge>
      case 'trial':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Trial</Badge>
      case 'free_access':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Acesso Gratuito</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Gerenciar Assinantes</h1>
          <p className="text-muted-foreground mt-1">
            Administre todos os clientes do SaaS, planos e acessos.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="flex-1 w-full space-y-1">
              <Label>Buscar Clínica / Email</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome da clínica ou email..."
                  className="pl-8 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48 space-y-1">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Suspenso">Suspenso</SelectItem>
                  <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Acesso Gratuito">Acesso Gratuito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48 space-y-1">
              <Label>Plano</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="básico">Básico</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full md:w-auto h-10 mt-6" onClick={clearFilters}>
              <FilterX className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FDFCF0] text-muted-foreground border-b uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome da Clínica</th>
                  <th className="px-4 py-3 font-semibold">Email do Admin</th>
                  <th className="px-4 py-3 font-semibold">Plano</th>
                  <th className="px-4 py-3 font-semibold">Data de Início</th>
                  <th className="px-4 py-3 font-semibold">Data de Renovação</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[220px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Carregando assinantes...
                    </td>
                  </tr>
                ) : paginatedSubs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum assinante encontrado para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  paginatedSubs.map((sub) => (
                    <tr
                      key={sub.subscription_id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-[#001F3F]">{sub.clinica_nome}</td>
                      <td className="px-4 py-3">{sub.email}</td>
                      <td className="px-4 py-3 capitalize">{sub.plan}</td>
                      <td className="px-4 py-3">{formatDate(sub.created_at)}</td>
                      <td className="px-4 py-3">{getRenewalDate(sub)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => openDetails(sub)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver Detalhes</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#B8860B] hover:text-[#9A7009] hover:bg-[#B8860B]/10"
                                  onClick={() => {
                                    setSelectedSub(sub)
                                    setNewPlan(sub.plan || 'Básico')
                                    setPlanModalOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar Plano</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedSub(sub)
                                    setSuspendModalOpen(true)
                                  }}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Suspender</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-900 hover:text-red-950 hover:bg-red-100"
                                  onClick={() => {
                                    setSelectedSub(sub)
                                    setCancelReason('')
                                    setCancelModalOpen(true)
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancelar</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => {
                                    setSelectedSub(sub)
                                    setRenewMonths('1')
                                    setRenewModalOpen(true)
                                  }}
                                >
                                  <RotateCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Renovar Manualmente</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredSubs.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} até{' '}
                {Math.min(currentPage * itemsPerPage, filteredSubs.length)} de {filteredSubs.length}{' '}
                registros
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium mx-2">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Assinatura</DialogTitle>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    Nome da Clínica
                  </span>
                  <span className="font-medium">{selectedSub.clinica_nome}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    E-mail do Admin
                  </span>
                  <span>{selectedSub.email}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    Plano Atual
                  </span>
                  <span className="capitalize">{selectedSub.plan || 'Básico'}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">Status</span>
                  <StatusBadge status={selectedSub.status} />
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    Data de Início
                  </span>
                  <span>{formatDate(selectedSub.created_at)}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    Data de Renovação
                  </span>
                  <span>{getRenewalDate(selectedSub)}</span>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Histórico de Pagamentos (Últimos 3)</h4>
                {recentPayments.length > 0 ? (
                  <div className="space-y-2">
                    {recentPayments.map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-md border"
                      >
                        <span className="text-muted-foreground">{formatDate(p.created_at)}</span>
                        <span className="font-medium text-green-600">R$ {p.amount.toFixed(2)}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {p.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md text-center">
                    Nenhuma transação encontrada.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Altere o plano do assinante. Um e-mail será enviado notificando a alteração.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Novo Plano</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Profissional">Profissional</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#B8860B] hover:bg-[#9A7009]" onClick={handleEditPlan}>
              Salvar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Suspender Assinante</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja suspender este assinante? O acesso será bloqueado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              Confirmar Suspensão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-900">Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Esta ação bloqueará permanentemente o acesso. Informe o motivo do cancelamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Motivo do Cancelamento</Label>
              <Textarea
                placeholder="Ex: Falta de pagamento, solicitação do cliente..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="bg-red-900 hover:bg-red-950"
              disabled={!cancelReason.trim()}
              onClick={handleCancel}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renewModalOpen} onOpenChange={setRenewModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-green-700">Renovar Manualmente</DialogTitle>
            <DialogDescription>Estenda o acesso deste assinante manualmente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Período de Renovação</Label>
              <Select value={renewMonths} onValueChange={setRenewMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Renovar por 1 Mês</SelectItem>
                  <SelectItem value="3">Renovar por 3 Meses</SelectItem>
                  <SelectItem value="12">Renovar por 1 Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleRenew}>
              Confirmar Renovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
