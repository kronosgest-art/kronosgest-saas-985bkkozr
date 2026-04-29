import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, KeyRound } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import ProfissionalFormModal from './ProfissionalFormModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ProfissionaisClinica({
  organizationId,
}: {
  organizationId: string | null
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProf, setEditingProf] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadProfissionais = async () => {
    if (!organizationId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('profissionais')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('tipo_profissional', 'profissional_cadastrado')
      .order('nome_completo', { ascending: true })

    if (!error && data) {
      setProfissionais(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProfissionais()
  }, [organizationId])

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('profissionais').delete().eq('id', deleteId)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao excluir profissional.' })
    } else {
      toast({ title: 'Sucesso', description: 'Profissional excluído.' })
      loadProfissionais()
    }
    setDeleteId(null)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profissionais')
      .update({ status: !currentStatus })
      .eq('id', id)

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao alterar status.' })
    } else {
      toast({ title: 'Sucesso', description: 'Status atualizado.' })
      loadProfissionais()
    }
  }

  if (loading) return <div className="p-4 text-center">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#001F3F]">Equipe Clínica</h2>
        <Button
          onClick={() => {
            setEditingProf(null)
            setIsModalOpen(true)
          }}
          className="bg-[#C5A059] text-[#333333] hover:bg-[#FDFCF0]"
        >
          <Plus className="h-4 w-4 mr-2" /> Novo Profissional
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        {profissionais.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum profissional cadastrado nesta clínica.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FDFCF0] text-[#001F3F] border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Especialidade</th>
                  <th className="px-4 py-3 font-semibold">Contato</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {profissionais.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#333333]">
                      <button
                        onClick={() => {
                          setEditingProf(p)
                          setIsModalOpen(true)
                        }}
                        className="hover:underline hover:text-[#C5A059]"
                      >
                        {p.nome_completo}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.especialidade || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs">{p.email || '-'}</span>
                        <span className="text-xs text-muted-foreground">{p.telefone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={p.status ? 'default' : 'secondary'}
                        className={p.status ? 'bg-green-600' : ''}
                      >
                        {p.status ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          title="Ativar/Desativar"
                        >
                          <KeyRound className="h-4 w-4 text-[#C5A059]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(p.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProfissionalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReload={loadProfissionais}
        organizationId={organizationId}
        profissionalToEdit={editingProf}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#333333] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C5A059]">Excluir Profissional</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza? Esta ação removerá o acesso do profissional ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-gray-300 hover:bg-gray-800 border-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
