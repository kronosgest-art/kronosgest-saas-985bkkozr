import { useState } from 'react'
import { useCRMState } from './use-crm-state'
import { useDebounce } from '@/hooks/use-debounce'
import { Plus, Settings, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { LeadTable } from './components/LeadTable'
import { TabDialog } from './components/TabDialog'
import { TagManagerDialog } from './components/TagManagerDialog'
import { LeadDialog } from './components/LeadDialog'

export default function CRM() {
  const state = useCRMState()
  const [activeTabId, setActiveTabId] = useState<string>(state.tabs[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [isTabDialogOpen, setIsTabDialogOpen] = useState(false)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)

  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)

  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false)
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null)

  const activeTab = state.tabs.find((t) => t.id === activeTabId)

  // Filtering
  const filteredLeads = state.leads.filter((lead) => {
    // Tab filter
    if (activeTab && activeTab.tagId) {
      if (lead.tagId !== activeTab.tagId) return false
    }
    // Search filter
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase()
      return lead.name.toLowerCase().includes(lower) || lead.email.toLowerCase().includes(lower)
    }
    return true
  })

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">CRM & Leads</h1>
          <p className="text-muted-foreground mt-1">Acompanhamento e captação de novos clientes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsTagManagerOpen(true)}
            className="border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10"
          >
            <Settings className="h-4 w-4 mr-2" />
            Etiquetas
          </Button>
          <Button
            onClick={() => {
              setEditingLeadId(null)
              setIsLeadDialogOpen(true)
            }}
            className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-px scrollbar-hide">
        {state.tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            onDoubleClick={() => {
              setEditingTabId(tab.id)
              setIsTabDialogOpen(true)
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
              activeTabId === tab.id
                ? 'border-[#C5A059] text-[#333333]'
                : 'border-transparent text-muted-foreground hover:text-[#333333] hover:border-border',
            )}
          >
            {tab.name}
          </button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditingTabId(null)
            setIsTabDialogOpen(true)
          }}
          className="text-muted-foreground"
        >
          <Plus className="h-4 w-4 mr-1" /> Nova Aba
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-lg shadow-subtle border border-border p-4 sm:p-6 min-h-[400px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md focus-visible:ring-[#C5A059]"
          />
        </div>

        {state.error ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-destructive p-8">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">{state.error}</p>
            <Button variant="outline" onClick={state.loadData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" /> Tentar Novamente
            </Button>
          </div>
        ) : (
          <LeadTable
            leads={filteredLeads}
            tags={state.tags}
            isLoading={state.isLoading}
            onEdit={(id) => {
              setEditingLeadId(id)
              setIsLeadDialogOpen(true)
            }}
            onDelete={state.deleteLead}
            onAddNew={() => {
              setEditingLeadId(null)
              setIsLeadDialogOpen(true)
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      <TabDialog
        open={isTabDialogOpen}
        onOpenChange={setIsTabDialogOpen}
        tabId={editingTabId}
        tabs={state.tabs}
        tags={state.tags}
        onSave={(id, data) => {
          const tab = id ? state.updateTab(id, data) : state.addTab(data)
          if (!id && tab) setActiveTabId((tab as any).id)
        }}
        onDelete={(id) => {
          state.deleteTab(id)
          if (activeTabId === id) setActiveTabId(state.tabs[0]?.id || '')
        }}
      />

      <TagManagerDialog
        open={isTagManagerOpen}
        onOpenChange={setIsTagManagerOpen}
        tags={state.tags}
        onSave={(id, data) => (id ? state.updateTag(id, data) : state.addTag(data))}
        onDelete={state.deleteTag}
      />

      <LeadDialog
        open={isLeadDialogOpen}
        onOpenChange={setIsLeadDialogOpen}
        leadId={editingLeadId}
        leads={state.leads}
        tags={state.tags}
        onSave={(id, data) => (id ? state.updateLead(id, data) : state.addLead(data))}
      />
    </div>
  )
}
