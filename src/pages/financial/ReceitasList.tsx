import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Info, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import ReceitaFormModal from './ReceitaFormModal'
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
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = receitas.filter((r) => {
    const desc = r.tipo_receita === 'Protocolo' ? r.protocolos?.nome : r.descricao_customizada
    const term = search.toLowerCase()
    return (
      (desc || '').toLowerCase().includes(term) ||
      r.tipo_receita.toLowerCase().includes(term) ||
      r.forma_pagamento.toLowerCase().includes(term) ||
      r.data_receita.includes(term)
    )
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    if (dateStr.length === 10) {
      const [y, m, d] = dateStr.split('-')
      return `${d}/${m}/${y}`
    }
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('receitas').delete().eq('id', deleteId)
    if (error) toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Receita excluída com sucesso.' })
      onReload()
    }
    setDeleteId(null)
  }

  if (receitas.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed bg-white">
        <Info className="h-10 w-10 mb-2 opacity-50" />
        <p className="mb-4 text-muted-foreground">Nenhuma receita cadastrada</p>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0] min-h-[44px]"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Receita
        </Button>
        <ReceitaFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onReload={onReload}
        />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0] min-h-[44px]"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Receita
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground bg-white border rounded-lg">
          Nenhuma transação encontrada.
        </p>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-7 gap-4 font-semibold text-[#001F3F] border-b pb-2 px-4 text-sm">
            <div>Data</div>
            <div>Tipo</div>
            <div className="col-span-2">Descrição</div>
            <div>Forma Pag.</div>
            <div>Valor</div>
            <div className="text-right">Ações</div>
          </div>
          <div className="hidden md:block space-y-2">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-7 gap-4 items-center p-4 border rounded-lg hover:bg-[#FDFCF0] group transition-colors bg-white text-sm"
              >
                <div className="text-muted-foreground">{formatDate(r.data_receita)}</div>
                <div className="font-medium">{r.tipo_receita}</div>
                <div className="col-span-2 font-medium text-[#001F3F] truncate">
                  {r.tipo_receita === 'Protocolo' ? r.protocolos?.nome : r.descricao_customizada}
                </div>
                <div>{r.forma_pagamento}</div>
                <div className="font-bold text-green-600">
                  +{' '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    r.valor,
                  )}
                </div>
                <div className="text-right flex items-center justify-end gap-2">
                  <Badge
                    variant={r.status === 'paga' ? 'default' : 'secondary'}
                    className={r.status === 'paga' ? 'bg-green-600' : ''}
                  >
                    {r.status?.toUpperCase() || 'PAGA'}
                  </Badge>
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
                    <p className="font-medium text-[#001F3F]">
                      {r.tipo_receita === 'Protocolo'
                        ? r.protocolos?.nome
                        : r.descricao_customizada}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(r.data_receita)} • {r.forma_pagamento}
                    </p>
                  </div>
                  <Badge
                    variant={r.status === 'paga' ? 'default' : 'secondary'}
                    className={r.status === 'paga' ? 'bg-green-600' : ''}
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
