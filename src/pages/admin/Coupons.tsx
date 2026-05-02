import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Tag, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Coupon {
  id: string
  codigo: string
  desconto_percentual: number | null
  desconto_fixo: number | null
  data_inicio: string
  data_fim: string
  uso_maximo: number
  uso_atual: number | null
  status: string | null
}

export default function Coupons() {
  const { user, loading: authLoading } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    codigo: '',
    tipo_desconto: 'percentual',
    valor_desconto: '',
    data_inicio: new Date().toISOString().slice(0, 10),
    data_fim: '',
    uso_maximo: '100',
  })

  useEffect(() => {
    if (user && !authLoading) loadCoupons()
  }, [user, authLoading])

  const loadCoupons = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('cupons')
      .select('*')
      .order('created_at', { ascending: false })
    if (error)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar cupons',
        description: error.message,
      })
    else setCoupons(data || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!formData.codigo || !formData.valor_desconto || !formData.data_fim) {
      toast({ variant: 'destructive', title: 'Preencha os campos obrigatórios' })
      return
    }

    const payload = {
      codigo: formData.codigo.toUpperCase(),
      desconto_percentual:
        formData.tipo_desconto === 'percentual' ? Number(formData.valor_desconto) : null,
      desconto_fixo: formData.tipo_desconto === 'fixo' ? Number(formData.valor_desconto) : null,
      data_inicio: new Date(formData.data_inicio).toISOString(),
      data_fim: new Date(formData.data_fim).toISOString(),
      uso_maximo: Number(formData.uso_maximo),
      planos_validos: ['Starter', 'Professional', 'Enterprise'],
      status: 'ativo',
      criado_por: user!.id,
    }

    const { error } = await supabase.from('cupons').insert(payload)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar', description: error.message })
    } else {
      toast({ title: 'Cupom criado com sucesso' })
      setIsModalOpen(false)
      loadCoupons()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('cupons').delete().eq('id', id)
    if (error)
      toast({ variant: 'destructive', title: 'Erro ao deletar', description: error.message })
    else loadCoupons()
  }

  if (authLoading || loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )

  const role = user?.user_metadata?.role || 'profissional'
  const isAdmin =
    user?.email === 'dra.morganavieira@gmail.com' ||
    role === 'admin' ||
    user?.user_metadata?.is_admin === true
  if (!isAdmin) return <Navigate to="/login" replace />

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A8A]">Gerenciar Cupons</h1>
          <p className="text-muted-foreground mt-1">Crie e acompanhe códigos promocionais</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#B8860B] hover:bg-[#DAA520] text-white">
              <Plus className="mr-2 h-4 w-4" /> Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Cupom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código do Cupom</Label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: PROMO20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Desconto</Label>
                  <Select
                    value={formData.tipo_desconto}
                    onValueChange={(v) => setFormData({ ...formData, tipo_desconto: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentual">Percentual (%)</SelectItem>
                      <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor do Desconto</Label>
                  <Input
                    type="number"
                    value={formData.valor_desconto}
                    onChange={(e) => setFormData({ ...formData, valor_desconto: e.target.value })}
                    placeholder="Ex: 20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limite de Usos</Label>
                  <Input
                    type="number"
                    value={formData.uso_maximo}
                    onChange={(e) => setFormData({ ...formData, uso_maximo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="w-full mt-4">
                Salvar Cupom
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-muted-foreground" /> {coupon.codigo}
                  </TableCell>
                  <TableCell>
                    {coupon.desconto_percentual
                      ? `${coupon.desconto_percentual}%`
                      : `R$ ${coupon.desconto_fixo}`}
                  </TableCell>
                  <TableCell>
                    {coupon.uso_atual || 0} / {coupon.uso_maximo}
                  </TableCell>
                  <TableCell>{new Date(coupon.data_fim).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {coupon.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum cupom encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
