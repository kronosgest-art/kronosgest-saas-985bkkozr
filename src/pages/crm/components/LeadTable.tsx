import { Lead, Tag } from '../types'
import { Edit2, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LeadTableProps {
  leads: Lead[]
  tags: Tag[]
  isLoading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAddNew: () => void
}

export function LeadTable({ leads, tags, isLoading, onEdit, onDelete, onAddNew }: LeadTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center p-8 text-muted-foreground animate-fade-in">
        <Users className="h-16 w-16 mb-4 opacity-20" />
        <h3 className="text-xl font-semibold text-[#333333] mb-2">Nenhum lead nesta aba</h3>
        <p className="max-w-sm mb-6">
          Você ainda não tem leads correspondentes aos filtros selecionados.
        </p>
        <Button onClick={onAddNew} className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white">
          Adicionar Novo Lead
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#001F3F] text-[#FDFCF0]">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Etiqueta</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((lead, index) => {
              const tag = tags.find((t) => t.id === lead.tagId)
              return (
                <tr
                  key={lead.id}
                  className={cn(
                    'hover:bg-muted/50 transition-colors',
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FDFCF0]/50',
                  )}
                >
                  <td className="px-4 py-3 font-medium text-[#333333]">{lead.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{lead.email}</div>
                    <div className="text-xs">{lead.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    {tag ? (
                      <Badge
                        variant="outline"
                        className={cn('border-transparent font-normal', tag.color)}
                      >
                        {tag.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Sem etiqueta</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{lead.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(lead.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(lead.id)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(lead.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {leads.map((lead) => {
          const tag = tags.find((t) => t.id === lead.tagId)
          return (
            <div
              key={lead.id}
              className="bg-white border border-border p-4 rounded-lg shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-[#333333]">{lead.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(lead.createdAt), 'dd/MM/yyyy')}
                  </p>
                </div>
                {tag && (
                  <Badge
                    variant="outline"
                    className={cn('border-transparent font-normal', tag.color)}
                  >
                    {tag.name}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{lead.email}</div>
                <div>{lead.phone}</div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm font-medium">{lead.status}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lead.id)}
                    className="h-8 px-2 text-blue-600"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(lead.id)}
                    className="h-8 px-2 text-red-600"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
