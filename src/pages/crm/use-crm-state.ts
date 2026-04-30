import { useState, useEffect, useCallback } from 'react'
import { Tag, Tab, Lead } from './types'
import { toast } from 'sonner'

const MOCK_TAGS: Tag[] = [
  { id: '1', name: 'Novo lead', color: 'bg-blue-100 text-blue-800' },
  { id: '2', name: 'Em atendimento', color: 'bg-yellow-100 text-yellow-800' },
  { id: '3', name: 'Agendado', color: 'bg-green-100 text-green-800' },
  { id: '4', name: 'Pendente de pagamento', color: 'bg-orange-100 text-orange-800' },
  { id: '5', name: 'Perdido', color: 'bg-red-100 text-red-800' },
  { id: '6', name: 'Paciente ativo', color: 'bg-emerald-100 text-emerald-800' },
  { id: '7', name: 'Paciente inativo/resgatar', color: 'bg-gray-100 text-gray-800' },
  { id: '8', name: 'Paciente VIP/indicação', color: 'bg-purple-100 text-purple-800' },
]

const MOCK_TABS: Tab[] = [
  { id: '1', name: 'Todos os Leads', tagId: null },
  { id: '2', name: 'Novos', tagId: '1' },
  { id: '3', name: 'Em Atendimento', tagId: '2' },
  { id: '4', name: 'Agendados', tagId: '3' },
]

const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 98765-4321',
    tagId: '1',
    status: 'Ativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.s@email.com',
    phone: '(11) 91234-5678',
    tagId: '2',
    status: 'Ativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mariana Costa',
    email: 'mariana.c@email.com',
    phone: '(21) 99887-7665',
    tagId: '3',
    status: 'Ativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'João Oliveira',
    email: 'joao.o@email.com',
    phone: '(31) 98877-6655',
    tagId: '4',
    status: 'Pendente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Beatriz Lima',
    email: 'beatriz.l@email.com',
    phone: '(41) 97766-5544',
    tagId: '8',
    status: 'Ativo',
    createdAt: new Date().toISOString(),
  },
]

export function useCRMState() {
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS)
  const [tabs, setTabs] = useState<Tab[]>(MOCK_TABS)
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setTimeout(() => {
      if (Math.random() < 0.05) {
        setError('Ocorreu um erro ao carregar os dados. Tente novamente.')
      }
      setIsLoading(false)
    }, 800)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const addTab = (tab: Omit<Tab, 'id'>) => {
    const newTab = { ...tab, id: crypto.randomUUID() }
    setTabs([...tabs, newTab])
    toast.success('Aba criada com sucesso!')
    return newTab
  }

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    toast.success('Aba atualizada com sucesso!')
  }

  const deleteTab = (id: string) => {
    setTabs(tabs.filter((t) => t.id !== id))
    toast.success('Aba deletada com sucesso!')
  }

  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: crypto.randomUUID() }
    setTags([...tags, newTag])
    toast.success('Etiqueta criada com sucesso!')
    return newTag
  }

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(tags.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    toast.success('Etiqueta atualizada com sucesso!')
  }

  const deleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id))
    setTabs(tabs.map((t) => (t.tagId === id ? { ...t, tagId: null } : t)))
    setLeads(leads.map((l) => (l.tagId === id ? { ...l, tagId: null } : l)))
    toast.success('Etiqueta deletada com sucesso!')
  }

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    setLeads([{ ...lead, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...leads])
    toast.success('Lead adicionado com sucesso!')
  }

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, ...updates } : l)))
    toast.success('Lead atualizado com sucesso!')
  }

  const deleteLead = (id: string) => {
    setLeads(leads.filter((l) => l.id !== id))
    toast.success('Lead deletado com sucesso!')
  }

  return {
    tags,
    tabs,
    leads,
    isLoading,
    error,
    loadData,
    addTab,
    updateTab,
    deleteTab,
    addTag,
    updateTag,
    deleteTag,
    addLead,
    updateLead,
    deleteLead,
  }
}
