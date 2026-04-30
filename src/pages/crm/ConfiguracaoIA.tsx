import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Bot, Save, AlertCircle, RefreshCw } from 'lucide-react'

interface Protocol {
  id: string
  nome: string
  descricao: string | null
}

interface ConfigIA {
  id?: string
  prompt_personalizado: string
  protocolos_selecionados: string[]
}

export default function ConfiguracaoIA() {
  const { user } = useAuth()
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [config, setConfig] = useState<ConfigIA>({
    prompt_personalizado: '',
    protocolos_selecionados: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data: protos, error: errProtos } = await supabase
        .from('protocolos')
        .select('id, nome, descricao')
        .or(`user_id.eq.${user.id},is_padrao.eq.true`)
        .order('nome')

      if (errProtos) throw errProtos
      setProtocols(protos || [])

      const { data: conf, error: errConf } = await (supabase.from('configuracao_ia' as any) as any)
        .select('*')
        .eq('profissional_id', user.id)
        .maybeSingle()

      if (errConf && errConf.code !== 'PGRST116') throw errConf

      if (conf) {
        setConfig({
          id: conf.id,
          prompt_personalizado: conf.prompt_personalizado || '',
          protocolos_selecionados: conf.protocolos_selecionados || [],
        })
      } else {
        setConfig({
          prompt_personalizado: '',
          protocolos_selecionados: protos?.map((p) => p.id) || [],
        })
      }
    } catch (err: any) {
      console.error(err)
      setError('Não foi possível carregar as configurações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = {
        profissional_id: user.id,
        prompt_personalizado: config.prompt_personalizado,
        protocolos_selecionados: config.protocolos_selecionados,
      }

      if (config.id) {
        const { error } = await (supabase.from('configuracao_ia' as any) as any)
          .update(payload)
          .eq('id', config.id)
        if (error) throw error
      } else {
        const { data, error } = await (supabase.from('configuracao_ia' as any) as any)
          .insert([payload])
          .select()
          .single()
        if (error) throw error
        if (data) setConfig((prev) => ({ ...prev, id: data.id }))
      }

      toast.success('Configuração salva com sucesso!')
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao salvar configuração.')
    } finally {
      setSaving(false)
    }
  }

  const toggleProtocol = (id: string, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      protocolos_selecionados: checked
        ? [...prev.protocolos_selecionados, id]
        : prev.protocolos_selecionados.filter((pid) => pid !== id),
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-[#333333]">{error}</h3>
        <Button onClick={loadData} variant="outline" className="text-[#001F3F]">
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#001F3F]">
          <Bot className="h-6 w-6 text-[#C5A059]" />
          Configuração da IA
        </h1>
        <p className="mt-1 text-muted-foreground">Personalize como a IA responde seus leads.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-[#FDFCF0]/20 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-[#333333]">
          Seu Prompt Personalizado
        </label>
        <Textarea
          placeholder="Descreva como você quer que a IA responda seus leads. Ex: Você é uma especialista em ozonioterapia..."
          className="min-h-[150px] resize-none focus-visible:ring-[#C5A059]"
          maxLength={500}
          value={config.prompt_personalizado}
          onChange={(e) => setConfig({ ...config, prompt_personalizado: e.target.value })}
        />
        <div className="text-right text-xs text-muted-foreground">
          {config.prompt_personalizado.length}/500
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#001F3F]">Protocolos Disponíveis</h2>
        <p className="text-sm text-muted-foreground">
          Selecione quais protocolos a IA pode sugerir aos seus leads.
        </p>

        {protocols.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed bg-white p-8 text-center">
            <Bot className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium text-[#333333]">Nenhum protocolo cadastrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie protocolos para que a IA possa utilizá-los.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {protocols.map((protocol) => {
              const isSelected = config.protocolos_selecionados.includes(protocol.id)
              return (
                <div
                  key={protocol.id}
                  className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#FDFCF0]/20 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#333333]">{protocol.nome}</h4>
                    {protocol.descricao && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {protocol.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 self-end items-center gap-3 sm:self-auto">
                    <span className="text-sm font-medium text-[#333333]">Incluir na IA</span>
                    <Switch
                      checked={isSelected}
                      onCheckedChange={(checked) => toggleProtocol(protocol.id, checked)}
                      className="data-[state=checked]:bg-[#C5A059]"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[200px] bg-[#C5A059] text-white hover:bg-[#C5A059]/90"
          size="lg"
        >
          {saving ? (
            <span className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Salvando...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="mr-2 h-5 w-5" /> Salvar Configuração
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
