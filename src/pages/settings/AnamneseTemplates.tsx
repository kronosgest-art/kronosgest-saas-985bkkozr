import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash, Star, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import TemplateDialog from './components/TemplateDialog'

export interface AnamneseQuestion {
  id: string
  titulo: string
  tipo: 'text' | 'checkbox' | 'select'
  opcoes?: string[]
  obrigatoria: boolean
}

export interface AnamneseTemplate {
  template_id: string
  nome_template: string
  eh_padrao: boolean
  perguntas: AnamneseQuestion[]
  criado_em: string
  atualizado_em: string
}

export default function AnamneseTemplates() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<AnamneseTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AnamneseTemplate | null>(null)

  const fetchTemplates = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('anamnese_templates' as any)
      .select('*')
      .eq('profissional_id', user.id)
      .order('eh_padrao', { ascending: false })
      .order('criado_em', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar modelos.', variant: 'destructive' })
    } else {
      setTemplates(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTemplates()
  }, [user])

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('anamnese_templates' as any)
      .delete()
      .eq('template_id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível deletar.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Modelo deletado.' })
      fetchTemplates()
    }
  }

  const handleSetDefault = async (id: string) => {
    if (!user) return
    await supabase
      .from('anamnese_templates' as any)
      .update({ eh_padrao: false })
      .eq('profissional_id', user.id)
    const { error } = await supabase
      .from('anamnese_templates' as any)
      .update({ eh_padrao: true })
      .eq('template_id', id)

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível definir padrão.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Modelo padrão atualizado.' })
      fetchTemplates()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Modelos de Anamnese</h1>
          <p className="text-muted-foreground">
            Gerencie os templates de perguntas para as consultas.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTemplate(null)
            setIsDialogOpen(true)
          }}
          className="bg-[#B8860B] hover:bg-[#B8860B]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Criar Novo Modelo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome do Modelo</th>
                  <th className="px-6 py-4 font-medium">Data de Criação</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8">
                      Carregando...
                    </td>
                  </tr>
                ) : templates.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-muted-foreground">
                      Nenhum modelo encontrado.
                    </td>
                  </tr>
                ) : (
                  templates.map((t) => (
                    <tr key={t.template_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        {t.nome_template}
                        {t.eh_padrao && (
                          <span className="bg-[#1E3A8A] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3" fill="currentColor" /> Padrão
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(t.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 flex items-center justify-end gap-2">
                        {!t.eh_padrao && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(t.template_id)}
                            title="Marcar como Padrão"
                          >
                            <Check className="h-4 w-4 text-[#B8860B]" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTemplate(t)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={t.eh_padrao}
                          onClick={() => handleDelete(t.template_id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <TemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={editingTemplate}
        onSave={() => {
          setIsDialogOpen(false)
          fetchTemplates()
        }}
      />
    </div>
  )
}
