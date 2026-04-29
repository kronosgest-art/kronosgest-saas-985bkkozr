import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Info, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import DespesaFormModal from './DespesaFormModal'
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

export default function DespesasList({
  despesas,
  search,
  onReload,
}: {
  despesas: any[]
  search: string
  onReload: () => void
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = despesas.filter((d) => {
    const term = search.toLowerCase()
    return (
      d.descricao.toLowerCase().includes(term) ||
      d.categoria.toLowerCase().includes(term) ||
      (d.forma_pagamento || '').toLowerCase().includes(term) ||
      d.data_despesa.includes(term)
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
    const { error } = await supabase.from('despesas').delete().eq('id', deleteId)
    if (error) toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Despesa excluída com sucesso.' })
      onReload()
    }
    setDeleteId(null)
  }

  if (despesas.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed bg-white">
        <Info className="h-10 w-10 mb-2 opacity-50" />
        <p className="mb-4 text-muted-foreground">Nenhuma despesa cadastrada</p>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0] min-h-[44px]"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Despesa
        </Button>
        <DespesaFormModal
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
          <Plus className="mr-2 h-4 w-4" /> Nova Despesa
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground bg-white border rounded-lg">
          Nenhuma transação encontrada.
        </p>
      ) : (
        <>
          <div className="hidden lg:grid grid-cols-9 gap-4 font-semibold text-[#001F3F] border-b pb-2 px-4 text-sm">
            <div>Data</div>
            <div>Categoria</div>
            <div className="col-span-2">Descrição</div>
            <div>Forma Pag.</div>
            <div>Conta</div>
            <div>Banco</div>
            <div>Valor</div>
            <div className="text-right">Ações</div>
          </div>
          <div className="hidden lg:block space-y-2">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-9 gap-4 items-center p-4 border rounded-lg hover:bg-[#FDFCF0] group transition-colors bg-white text-sm"
              >
                <div className="text-muted-foreground">{formatDate(d.data_despesa)}</div>
                <div>{d.categoria}</div>
                <div className="col-span-2 font-medium text-[#001F3F] truncate">{d.descricao}</div>
                <div>{d.forma_pagamento}</div>
                <div className="truncate text-xs">{d.tipo_conta}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {d.banco_retirada || '-'}
                </div>
                <div className="font-bold text-red-600">
                  -{' '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    d.valor,
                  )}
                </div>
                <div className="text-right flex items-center justify-end gap-2">
                  <Badge
                    variant={d.status === 'paga' ? 'default' : 'secondary'}
                    className={d.status === 'paga' ? 'bg-green-600' : ''}
                  >
                    {d.status.toUpperCase()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(d.id)}
                    className="text-[#C5A059] hover:bg-white min-h-[44px] min-w-[44px] opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="block lg:hidden space-y-4">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="flex flex-col p-4 border rounded-lg bg-white shadow-sm gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[#001F3F]">{d.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(d.data_despesa)} • {d.categoria}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.forma_pagamento} • {d.tipo_conta}{' '}
                      {d.banco_retirada ? `(${d.banco_retirada})` : ''}
                    </p>
                  </div>
                  <Badge
                    variant={d.status === 'paga' ? 'default' : 'secondary'}
                    className={d.status === 'paga' ? 'bg-green-600' : ''}
                  >
                    {d.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-red-600">
                    -{' '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      d.valor,
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(d.id)}
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
            <AlertDialogTitle className="text-[#C5A059]">Excluir Despesa</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza que deseja excluir esta despesa?
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

      <DespesaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReload={onReload}
      />
    </div>
  )
}
