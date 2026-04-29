import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Loader2, Trash2, KeyRound } from 'lucide-react'
import { PatientAccessDialog } from './PatientAccessDialog'
import { toast } from '@/hooks/use-toast'

export function PatientAccessList() {
  const [acessos, setAcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAcessos() {
    setLoading(true)
    const { data } = await supabase
      .from('pacientes_acesso')
      .select('*, pacientes(nome_completo)')
      .order('created_at', { ascending: false })
    if (data) setAcessos(data)
    setLoading(false)
  }

  useEffect(() => {
    loadAcessos()
  }, [])

  async function toggleAtivo(id: string, current: boolean) {
    const { error } = await supabase
      .from('pacientes_acesso')
      .update({ ativo: !current })
      .eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: current ? 'Acesso desativado.' : 'Acesso ativado.' })
      loadAcessos()
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir o acesso deste paciente?')) {
      const { error } = await supabase.from('pacientes_acesso').delete().eq('id', id)
      if (error) {
        toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Acesso excluído com sucesso.' })
        loadAcessos()
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="shadow-sm border-[#C5A059]/20">
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 border-b border-[#C5A059]/20">
          <div className="flex items-center gap-2 text-[#001F3F] font-semibold">
            <KeyRound className="h-5 w-5 text-[#C5A059]" />
            <span>Credenciais de Acesso</span>
          </div>
          <PatientAccessDialog onCreated={loadAcessos} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FDFCF0] text-[#333333] border-b border-[#C5A059]/20">
              <tr>
                <th className="px-4 py-3 font-medium">Paciente</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">CPF (Senha)</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {acessos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum acesso cadastrado.
                  </td>
                </tr>
              ) : (
                acessos.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b last:border-0 hover:bg-[#FDFCF0]/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#001F3F]">
                      {a.pacientes?.nome_completo || 'Desconhecido'}
                    </td>
                    <td className="px-4 py-3 text-[#333333]">{a.email}</td>
                    <td className="px-4 py-3 text-[#333333]">{a.cpf}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={a.ativo}
                          onCheckedChange={() => toggleAtivo(a.id, a.ativo)}
                          className="data-[state=checked]:bg-[#C5A059]"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(a.id)}
                        className="text-[#C5A059] hover:bg-[#C5A059]/10"
                      >
                        <Trash2 className="h-4 w-4" />
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
  )
}
