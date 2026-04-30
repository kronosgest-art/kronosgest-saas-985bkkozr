import { useState, useEffect, useCallback } from 'react'
import { Column, Lead } from './types'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export function useCRMState() {
  const { user } = useAuth()
  const [columns, setColumns] = useState<Column[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const [tagsRes, leadsRes] = await Promise.all([
        supabase.from('etiquetas').select('*').order('created_at', { ascending: true }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
      ])

      if (tagsRes.error) throw tagsRes.error
      if (leadsRes.error) throw leadsRes.error

      setColumns(tagsRes.data.map((t: any) => ({ id: t.id, name: t.nome, color: t.cor })))
      setLeads(
        leadsRes.data.map((l: any) => ({
          id: l.id,
          name: l.name,
          email: l.email || '',
          phone: l.phone || '',
          columnId: l.etiqueta_id,
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

    const leadsSub = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadData)
      .subscribe()

    return () => {
      supabase.removeChannel(tagsSub)
      supabase.removeChannel(leadsSub)
    }
  }, [user, loadData])

  const addColumn = async (column: Omit<Column, 'id'>) => {
    if (!user) return null
    const { data, error } = await supabase
      .from('etiquetas')
      .insert({
        user_id: user.id,
        nome: column.name,
        cor: column.color || '#C5A059',
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao criar coluna')
      return null
    }
    toast.success('Coluna criada com sucesso!')
    const newCol = { id: data.id, name: data.nome, color: data.cor }
    setColumns((prev) => [...prev, newCol])
    return newCol
  }

  const updateColumn = async (id: string, updates: Partial<Column>) => {
    const payload: any = {}
    if (updates.name !== undefined) payload.nome = updates.name

    const { error } = await supabase.from('etiquetas').update(payload).eq('id', id)
    if (error) toast.error('Erro ao atualizar coluna')
    else toast.success('Coluna atualizada com sucesso!')
  }

  const deleteColumn = async (id: string) => {
    const { error } = await supabase.from('etiquetas').delete().eq('id', id)
    if (error) toast.error('Erro ao deletar coluna')
    else toast.success('Coluna deletada com sucesso!')
  }

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    if (!user) return
    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      etiqueta_id: lead.columnId,
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
    if (updates.columnId !== undefined) payload.etiqueta_id = updates.columnId
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

  const moveLead = async (leadId: string, newColumnId: string | null) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, columnId: newColumnId } : l)))
    const { error } = await supabase
      .from('leads')
      .update({ etiqueta_id: newColumnId })
      .eq('id', leadId)
    if (error) {
      toast.error('Erro ao mover lead')
      loadData()
    } else {
      toast.success('Lead movido com sucesso!')
    }
  }

  return {
    columns,
    leads,
    isLoading,
    error,
    loadData,
    addColumn,
    updateColumn,
    deleteColumn,
    addLead,
    updateLead,
    deleteLead,
    moveLead,
  }
}
