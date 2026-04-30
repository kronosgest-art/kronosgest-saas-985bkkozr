import { useState } from 'react'
import { useCRMState } from './use-crm-state'
import {
  Plus,
  AlertCircle,
  RefreshCw,
  LayoutList,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ColumnDialog } from './components/ColumnDialog'
import { LeadDialog } from './components/LeadDialog'

export default function CRM() {
  const state = useCRMState()

  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false)
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)

  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false)
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null)
  const [prefilledColumnId, setPrefilledColumnId] = useState<string>('none')

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId)
    setDraggedLeadId(leadId)
  }

  const handleDragEnd = () => {
    setDraggedLeadId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, columnId: string | null) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain')
    if (leadId) {
      state.moveLead(leadId, columnId === 'uncategorized' ? null : columnId)
    }
    setDraggedLeadId(null)
  }

  const allColumns = [{ id: 'uncategorized', name: 'Sem Etiqueta' }, ...state.columns]

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">CRM Kanban</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus leads visualmente com arrastar e soltar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setEditingColumnId(null)
              setIsColumnDialogOpen(true)
            }}
            className="bg-[#001F3F] hover:bg-[#001F3F]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Coluna
          </Button>
        </div>
      </div>

      {state.error ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full text-center text-destructive p-8 bg-white rounded-lg shadow-sm border border-border">
          <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">{state.error}</p>
          <Button variant="outline" onClick={state.loadData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" /> Tentar Novamente
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 h-full items-start min-h-[500px]">
            {state.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[320px] w-[320px] flex flex-col gap-3 bg-muted/30 p-3 rounded-lg border border-border h-full"
                  >
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ))
              : allColumns.map((col) => {
                  const colLeads = state.leads.filter((l) =>
                    col.id === 'uncategorized' ? l.columnId === null : l.columnId === col.id,
                  )
                  return (
                    <div
                      key={col.id}
                      className="min-w-[320px] w-[320px] flex-shrink-0 flex flex-col bg-muted/10 rounded-lg border border-border h-full max-h-full"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, col.id)}
                    >
                      {/* Column Header */}
                      <div className="p-3 bg-[#C5A059] text-white rounded-t-lg flex justify-between items-center group shadow-sm">
                        <h3 className="font-semibold text-sm truncate">
                          {col.name}{' '}
                          <span className="ml-2 opacity-70 text-xs font-normal">
                            ({colLeads.length})
                          </span>
                        </h3>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white hover:text-[#C5A059] hover:bg-white transition-colors"
                            onClick={() => {
                              setEditingLeadId(null)
                              setPrefilledColumnId(col.id === 'uncategorized' ? 'none' : col.id)
                              setIsLeadDialogOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          {col.id !== 'uncategorized' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-white hover:text-[#C5A059] hover:bg-white transition-colors"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingColumnId(col.id)
                                    setIsColumnDialogOpen(true)
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" /> Renomear
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => state.deleteColumn(col.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Deletar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      {/* Cards Container */}
                      <div className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                        {colLeads.length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                            <LayoutList className="h-10 w-10 mb-3 opacity-20" />
                            <span className="text-sm font-medium mb-4">
                              Nenhum lead nesta coluna
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10"
                              onClick={() => {
                                setEditingLeadId(null)
                                setPrefilledColumnId(col.id === 'uncategorized' ? 'none' : col.id)
                                setIsLeadDialogOpen(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Novo Lead
                            </Button>
                          </div>
                        ) : (
                          colLeads.map((lead) => (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead.id)}
                              onDragEnd={handleDragEnd}
                              className={cn(
                                'bg-[#FDFCF0] border border-border/50 rounded-md p-4 shadow-sm cursor-grab active:cursor-grabbing group transition-all hover:shadow-md hover:border-[#C5A059]/50',
                                draggedLeadId === lead.id && 'opacity-50 scale-95',
                              )}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-[#333333] leading-tight">
                                  {lead.name}
                                </h4>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1 text-muted-foreground"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingLeadId(lead.id)
                                        setIsLeadDialogOpen(true)
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4 mr-2" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => state.deleteLead(lead.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" /> Deletar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="space-y-2 text-xs text-muted-foreground">
                                {lead.email && (
                                  <div className="flex items-center">
                                    <Mail className="h-3.5 w-3.5 mr-2 opacity-60 shrink-0" />
                                    <span className="truncate">{lead.email}</span>
                                  </div>
                                )}
                                {lead.phone && (
                                  <div className="flex items-center">
                                    <Phone className="h-3.5 w-3.5 mr-2 opacity-60 shrink-0" />
                                    <span>{lead.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center mt-3 pt-3 border-t border-border/50">
                                  <Calendar className="h-3.5 w-3.5 mr-2 opacity-60 shrink-0" />
                                  <span>
                                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ColumnDialog
        open={isColumnDialogOpen}
        onOpenChange={setIsColumnDialogOpen}
        columnId={editingColumnId}
        columns={state.columns}
        onSave={(id, data) => {
          if (id) state.updateColumn(id, data)
          else state.addColumn(data)
        }}
      />

      <LeadDialog
        open={isLeadDialogOpen}
        onOpenChange={setIsLeadDialogOpen}
        leadId={editingLeadId}
        leads={state.leads}
        columns={state.columns}
        prefilledColumnId={prefilledColumnId}
        onSave={(id, data) => {
          if (id) state.updateLead(id, data)
          else state.addLead(data)
        }}
      />
    </div>
  )
}
