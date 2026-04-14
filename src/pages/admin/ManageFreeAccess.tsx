import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionInfo {
  subscription_id: string
  user_id: string
  nome: string
  email: string
  status: string
  trial_end_date: string
  free_access_end_date: string
}

export default function ManageFreeAccess() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)
  const [days, setDays] = useState('30')
  const { toast } = useToast()

  const loadSubscriptions = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_admin_subscriptions')
    if (!error && data) {
      setSubscriptions(data as SubscriptionInfo[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const handleOpenModal = (subId: string) => {
    setSelectedSubId(subId)
    setIsModalOpen(true)
  }

  const handleLiberarAcesso = async () => {
    if (!selectedSubId || !days) return
    const daysNum = parseInt(days)
    if (isNaN(daysNum) || daysNum <= 0) {
      toast({
        title: 'Aviso',
        description: 'Insira um número válido de dias',
        variant: 'destructive',
      })
      return
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + daysNum)

    const { error } = await supabase.rpc('admin_update_subscription', {
      p_subscription_id: selectedSubId,
      p_status: 'free_access',
      p_free_access_start_date: startDate.toISOString(),
      p_free_access_end_date: endDate.toISOString(),
    })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: `✅ Seu acesso foi liberado por ${daysNum} dias` })
      setIsModalOpen(false)
      loadSubscriptions()
    }
  }

  const handleSuspenderAcesso = async (subId: string) => {
    const { error } = await supabase.rpc('admin_update_subscription', {
      p_subscription_id: subId,
      p_status: 'suspended',
    })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: '⏰ Seu acesso será bloqueado em 2 dias. Faça upgrade para continuar' })
      loadSubscriptions()
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Acessos Gratuitos</h1>
        <p className="text-muted-foreground mt-2">
          Administre o período de trial e acessos liberados dos profissionais.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Expiração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum profissional encontrado com os status elegíveis.
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => {
                  let expiracao = 'N/A'
                  if (sub.status === 'free_access' && sub.free_access_end_date) {
                    expiracao = new Date(sub.free_access_end_date).toLocaleDateString('pt-BR')
                  } else if (sub.trial_end_date) {
                    expiracao = new Date(sub.trial_end_date).toLocaleDateString('pt-BR')
                  }

                  return (
                    <TableRow key={sub.subscription_id}>
                      <TableCell className="font-medium">{sub.nome}</TableCell>
                      <TableCell>{sub.email}</TableCell>
                      <TableCell>
                        <span className="capitalize px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                          {sub.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>{expiracao}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleOpenModal(sub.subscription_id)}
                        >
                          Liberar Acesso Gratuito
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSuspenderAcesso(sub.subscription_id)}
                        >
                          Suspender Acesso
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quantos dias de acesso gratuito?</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="1"
                placeholder="Ex: 30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLiberarAcesso}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
