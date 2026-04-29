import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Info, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
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

export default function ReceitasList({
  receitas,
  search,
  onReload,
}: {
  receitas: any[]
  search: string
  onReload: () => void
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = receitas.filter((r) => {
    const desc = r.protocolos?.nome || 'Venda'
    const pat = r.pacientes?.nome_completo || ''
    const term = search.toLowerCase()
    return (
      desc.toLowerCase().includes(term) ||
      pat.toLowerCase().includes(term) ||
      r.data_venda.includes(term)
    )
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('vendas').delete().eq('id', deleteId)
    if (error) toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Receita excluída com sucesso.' })
      onReload()
    }
    setDeleteId(null)
  }

  if (receitas.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed">
        <Info className="h-10 w-10 mb-2 opacity-50" />
        <p className="mb-4">Nenhuma receita cadastrada</p>
        <Link to="/sessions">
          <Button className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0] min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" /> Nova Receita
          </Button>
        </Link>
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/sessions">
          <Button className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0] min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" /> Nova Receita
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          Nenhuma receita encontrada para a busca.
        </p>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-5 gap-4 font-semibold text-[#001F3F] border-b pb-2 px-4">
            <div>Data</div>
            <div>Descrição</div>
            <div>Paciente</div>
            <div>Valor</div>
            <div className="text-right">Ações</div>
          </div>
          <div className="hidden md:block space-y-2">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-5 gap-4 items-center p-4 border rounded-lg hover:bg-[#FDFCF0] group transition-colors bg-white"
              >
                <div className="text-sm text-muted-foreground">{formatDate(r.data_venda)}</div>
                <div className="font-medium text-[#001F3F]">{r.protocolos?.nome || 'Venda'}</div>
                <div className="text-sm">{r.pacientes?.nome_completo || '-'}</div>
                <div className="font-bold text-green-600">
                  +{' '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    r.valor,
                  )}
                </div>
                <div className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(r.id)}
                    className="text-[#C5A059] hover:bg-white min-h-[44px] min-w-[44px] opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="block md:hidden space-y-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="flex flex-col p-4 border rounded-lg bg-white shadow-sm gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[#001F3F]">{r.protocolos?.nome || 'Venda'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(r.data_venda)} • {r.pacientes?.nome_completo || 'Sem paciente'}
                    </p>
                  </div>
                  <Badge
                    variant={r.status === 'pago' ? 'default' : 'secondary'}
                    className={r.status === 'pago' ? 'bg-green-600' : ''}
                  >
                    {r.status?.toUpperCase() || 'PAGA'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-green-600">
                    +{' '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      r.valor,
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(r.id)}
                    className="text-[#C5A059] hover:bg-[#FDFCF0] min-h-[44px] min-w-[44px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#333333] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C5A059]">Excluir Receita</AlertDialogTitle>
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
