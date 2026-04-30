import { useState, useEffect, useCallback } from 'react'
import { Tag, Tab, Lead } from './types'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export function useCRMState() {
  const { user } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [tabs, setTabs] = useState<Tab[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const [tagsRes, tabsRes, leadsRes] = await Promise.all([
        supabase.from('etiquetas').select('*').order('created_at', { ascending: true }),
        supabase.from('abas_crm').select('*').order('created_at', { ascending: true }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
      ])

      if (tagsRes.error) throw tagsRes.error
      if (tabsRes.error) throw tabsRes.error
      if (leadsRes.error) throw leadsRes.error

      setTags(tagsRes.data.map((t: any) => ({ id: t.id, name: t.nome, color: t.cor })))
      setTabs(tabsRes.data.map((t: any) => ({ id: t.id, name: t.nome, tagId: t.etiqueta_id })))
      setLeads(
        leadsRes.data.map((l: any) => ({
          id: l.id,
          name: l.name,
          email: l.email || '',
          phone: l.phone || '',
          tagId: l.etiqueta_id,
          status: l.status,
          createdAt: l.created_at,
        })),
      )
    } catch (err: any) {
      console.error(err)
      setError('Ocorreu um erro ao carregar os dados. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!user) return

    const tagsSub = supabase
      .channel('tags-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'etiquetas' }, loadData)
      .subscribe()

    const tabsSub = supabase
      .channel('tabs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'abas_crm' }, loadData)
      .subscribe()

    const leadsSub = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadData)
      .subscribe()

    return () => {
      supabase.removeChannel(tagsSub)
      supabase.removeChannel(tabsSub)
      supabase.removeChannel(leadsSub)
    }
  }, [user, loadData])

  const addTab = async (tab: Omit<Tab, 'id'>) => {
    if (!user) return null
    const { data, error } = await supabase
      .from('abas_crm')
      .insert({
        user_id: user.id,
        nome: tab.name,
        etiqueta_id: tab.tagId,
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao criar aba')
      return null
    }
    toast.success('Aba criada com sucesso!')
    const newTab = { id: data.id, name: data.nome, tagId: data.etiqueta_id }
    setTabs((prev) => [...prev, newTab])
    return newTab
  }

  const updateTab = async (id: string, updates: Partial<Tab>) => {
    const payload: any = {}
    if (updates.name !== undefined) payload.nome = updates.name
    if (updates.tagId !== undefined) payload.etiqueta_id = updates.tagId

    const { error } = await supabase.from('abas_crm').update(payload).eq('id', id)
    if (error) toast.error('Erro ao atualizar aba')
    else toast.success('Aba atualizada com sucesso!')
  }

  const deleteTab = async (id: string) => {
    const { error } = await supabase.from('abas_crm').delete().eq('id', id)
    if (error) toast.error('Erro ao deletar aba')
    else toast.success('Aba deletada com sucesso!')
  }

  const addTag = async (tag: Omit<Tag, 'id'>) => {
    if (!user) return null
    const { data, error } = await supabase
      .from('etiquetas')
      .insert({
        user_id: user.id,
        nome: tag.name,
        cor: tag.color,
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao criar etiqueta')
      return null
    }
    toast.success('Etiqueta criada com sucesso!')
    const newTag = { id: data.id, name: data.nome, color: data.cor }
    setTags((prev) => [...prev, newTag])
    return newTag
  }

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    const payload: any = {}
    if (updates.name !== undefined) payload.nome = updates.name
    if (updates.color !== undefined) payload.cor = updates.color

    const { error } = await supabase.from('etiquetas').update(payload).eq('id', id)
    if (error) toast.error('Erro ao atualizar etiqueta')
    else toast.success('Etiqueta atualizada com sucesso!')
  }

  const deleteTag = async (id: string) => {
    const { error } = await supabase.from('etiquetas').delete().eq('id', id)
    if (error) toast.error('Erro ao deletar etiqueta')
    else toast.success('Etiqueta deletada com sucesso!')
  }

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    if (!user) return
    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      etiqueta_id: lead.tagId,
      status: lead.status,
    })
    if (error) toast.error('Erro ao adicionar lead')
    else toast.success('Lead adicionado com sucesso!')
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const payload: any = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.email !== undefined) payload.email = updates.email
    if (updates.phone !== undefined) payload.phone = updates.phone
    if (updates.tagId !== undefined) payload.etiqueta_id = updates.tagId
    if (updates.status !== undefined) payload.status = updates.status

    const { error } = await supabase.from('leads').update(payload).eq('id', id)
    if (error) toast.error('Erro ao atualizar lead')
    else toast.success('Lead atualizado com sucesso!')
  }

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) toast.error('Erro ao deletar lead')
    else toast.success('Lead deletado com sucesso!')
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
