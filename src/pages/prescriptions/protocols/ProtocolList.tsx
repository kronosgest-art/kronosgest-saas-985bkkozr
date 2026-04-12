import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Edit, Printer, Trash2, ShoppingCart } from 'lucide-react'
import { Protocol } from './use-protocols'
import { printProtocol } from '@/lib/print-protocol'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

interface ProtocolListProps {
  protocols: Protocol[]
  searchTerm: string
  typeFilter: string
  durationFilter: string
  onEdit: (p: Protocol) => void
  onDuplicate: (p: Protocol) => void
  onDelete: (id: string) => void
  onSelect?: (p: Protocol) => void
  onSell?: (p: Protocol) => void
}

export default function ProtocolList({
  protocols,
  searchTerm,
  typeFilter,
  durationFilter,
  onEdit,
  onDuplicate,
  onDelete,
  onSelect,
  onSell,
}: ProtocolListProps) {
  const { user } = useAuth()

  const filtered = useMemo(() => {
    return protocols.filter((p) => {
      const matchSearch =
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.suplementos || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = typeFilter === 'all' ? true : p.tipo === typeFilter
      const matchDuration = durationFilter === 'all' ? true : p.duracao === durationFilter
      return matchSearch && matchType && matchDuration
    })
  }, [protocols, searchTerm, typeFilter, durationFilter])

  const handlePrint = (p: Protocol) => {
    if (!user?.id) return
    printProtocol(p, user.id)
  }

  const handleCopy = (p: Protocol) => {
    navigator.clipboard.writeText(`Protocolo: ${p.nome}\n\n${p.suplementos}`)
    toast({
      title: 'Copiado',
      description: 'Conteúdo do protocolo copiado para a área de transferência.',
    })
    if (onSelect) onSelect(p)
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted/10">
        Nenhum protocolo encontrado.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((p) => (
        <Card
          key={p.id}
          className="flex flex-col overflow-hidden border-primary/10 hover:shadow-md transition-all"
        >
          <CardContent className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 gap-2">
              <h3 className="font-semibold text-lg text-primary line-clamp-2">{p.nome}</h3>
              {p.is_padrao && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                >
                  Padrão
                </Badge>
              )}
            </div>

            <div className="flex gap-2 mb-4 text-xs">
              {p.tipo && (
                <Badge variant="outline" className="text-slate-600">
                  {p.tipo}
                </Badge>
              )}
              {p.duracao && (
                <Badge variant="outline" className="text-slate-600">
                  {p.duracao}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">
              {p.descricao || 'Sem descrição.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-slate-100">
              <Button
                size="sm"
                variant="default"
                className="flex-1 text-xs whitespace-nowrap"
                onClick={() => handleCopy(p)}
              >
                <Copy className="w-3 h-3 mr-1" /> Copiar
              </Button>
              {onSell && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs whitespace-nowrap text-green-700 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-800"
                  onClick={() => onSell(p)}
                  title="Vender Protocolo"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" /> Vender
                </Button>
              )}
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => handlePrint(p)}
                title="Imprimir PDF"
              >
                <Printer className="w-4 h-4 text-slate-600" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => onEdit(p)}
                title="Editar"
              >
                <Edit className="w-4 h-4 text-slate-600" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => onDuplicate(p)}
                title="Duplicar"
              >
                <Copy className="w-4 h-4 text-slate-600" />
              </Button>
              {!p.is_padrao && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => onDelete(p.id!)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
