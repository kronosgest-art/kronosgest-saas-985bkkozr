import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ShoppingCart, Trash2, Info } from 'lucide-react'
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
import { toast } from '@/hooks/use-toast'
import { SellProtocolDialog } from '@/components/protocols/SellProtocolDialog'

export default function Protocols() {
  const [protocolos, setProtocolos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [protocolToDelete, setProtocolToDelete] = useState<string | null>(null)

  const loadProtocolos = async () => {
    setLoading(true)
    setError(false)
    const { data, error: err } = await supabase.from('protocolos').select('*').order('nome')
    if (err) {
      setError(true)
    } else if (data) {
      setProtocolos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProtocolos()
  }, [])

  const handleDelete = async () => {
    if (!protocolToDelete) return
    const { error } = await supabase.from('protocolos').delete().eq('id', protocolToDelete)
    if (error)
      toast({ title: 'Erro', description: 'Erro ao excluir protocolo.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Protocolo excluído com sucesso.' })
      setProtocolToDelete(null)
      loadProtocolos()
    }
  }

  if (loading)
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-500 mb-4 font-medium">Erro ao carregar os protocolos.</p>
        <Button onClick={loadProtocolos} className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F] tracking-tight">Protocolos</h1>
          <p className="text-muted-foreground mt-1">Gerencie e venda seus protocolos clínicos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="text-[#333333] hover:border-[#C5A059]">
            <Plus className="mr-2 h-4 w-4" /> Novo Protocolo
          </Button>
          <SellProtocolDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {protocolos.map((protocolo) => (
          <Card key={protocolo.id} className="flex flex-col shadow-sm hover:shadow-md relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setProtocolToDelete(protocolo.id)}
              className="absolute top-2 right-2 text-[#C5A059] hover:bg-[#FDFCF0] h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardHeader className="pr-12">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-xl line-clamp-1 text-[#001F3F]">
                  {protocolo.nome}
                </CardTitle>
                {protocolo.is_padrao && <Badge variant="secondary">Padrão</Badge>}
              </div>
              <CardDescription>{protocolo.tipo || 'Protocolo Clínico'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Duração:</strong> {protocolo.duracao || 'Não especificada'}
                </p>
                <p className="text-lg font-bold text-[#C5A059] mt-2">
                  {protocolo.valor_total
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        protocolo.valor_total,
                      )
                    : 'Valor não definido'}
                </p>
              </div>
              <SellProtocolDialog
                trigger={
                  <Button className="w-full mt-4 bg-[#C5A059] hover:bg-[#A88640] text-white">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Vender Este Protocolo
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ))}

        {protocolos.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg border-dashed">
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

      <AlertDialog open={!!protocolToDelete} onOpenChange={(o) => !o && setProtocolToDelete(null)}>
        <AlertDialogContent className="bg-[#333333] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C5A059]">Excluir Protocolo</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza que deseja excluir este protocolo?
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
