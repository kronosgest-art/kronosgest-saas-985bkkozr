import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

export interface Protocol {
  id?: string
  nome: string
  tipo: string
  duracao: string
  descricao: string
  suplementos: string
  contraindicacoes: string
  is_padrao: boolean
  vezes_prescrito?: number
  created_at?: string
}

export function useProtocols() {
  const { user } = useAuth()
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProtocols = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('protocolos')
        .select('*')
        .or(`user_id.eq.${user.id},is_padrao.eq.true`)
        .order('vezes_prescrito', { ascending: false })

      if (error) throw error
      setProtocols(data || [])
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar protocolos',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchProtocols()
  }, [fetchProtocols])

  const saveProtocol = async (protocol: Protocol) => {
    if (!user?.id) return
    try {
      const { error } = protocol.id
        ? await supabase.from('protocolos').update(protocol).eq('id', protocol.id)
        : await supabase.from('protocolos').insert({ ...protocol, user_id: user.id })

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Protocolo salvo com sucesso.' })
      await fetchProtocols()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const deleteProtocol = async (id: string) => {
    try {
      const { error } = await supabase.from('protocolos').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Protocolo removido.' })
      await fetchProtocols()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const incrementUsage = async (id: string, current: number) => {
    await supabase
      .from('protocolos')
      .update({ vezes_prescrito: current + 1 })
      .eq('id', id)
    fetchProtocols() // silent refresh
  }

  return {
    protocols,
    loading,
    saveProtocol,
    deleteProtocol,
    incrementUsage,
    refresh: fetchProtocols,
  }
}
