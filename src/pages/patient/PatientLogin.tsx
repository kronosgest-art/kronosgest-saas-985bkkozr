import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function PatientLogin() {
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const cleanCpf = cpf.replace(/\D/g, '')
      const { data, error } = await supabase
        .from('pacientes_acesso')
        .select('*, pacientes(nome_completo, id)')
        .eq('email', email)
        .eq('cpf', cleanCpf)
        .eq('ativo', true)
        .single()

      if (error || !data) {
        toast({
          title: 'Acesso Negado',
          description: 'Email ou CPF inválidos.',
          variant: 'destructive',
        })
      } else {
        const sessionData = {
          acesso_id: data.id,
          paciente_id: data.paciente_id,
          nome_completo: data.pacientes?.nome_completo || 'Paciente',
        }
        localStorage.setItem('patient_session', JSON.stringify(sessionData))
        toast({ title: 'Bem-vindo(a)', description: `Olá, ${sessionData.nome_completo}!` })
        navigate('/patient-dashboard')
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro ao conectar. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0] px-4">
      <Card className="w-full max-w-md shadow-lg border-[#C5A059]">
        <CardHeader className="text-center bg-[#FDFCF0] rounded-t-xl border-b border-[#C5A059]/20">
          <div className="mx-auto mb-4 bg-[#001F3F] text-[#C5A059] p-3 rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl">
            KG
          </div>
          <CardTitle className="text-2xl text-[#001F3F]">Acesso do Paciente</CardTitle>
          <CardDescription className="text-[#333333]">
            Acesse seus agendamentos e histórico
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#333333]">
                Email cadastrado
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-visible:ring-[#C5A059]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-[#333333]">
                Senha
              </Label>
              <Input
                id="cpf"
                type="password"
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="CPF sem formatação"
                className="focus-visible:ring-[#C5A059]"
              />
            </div>
            <div className="pt-2 space-y-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C5A059] hover:bg-[#A88640] text-[#FDFCF0] font-bold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Entrar
              </Button>
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => navigate('/login')}
                  className="text-[#333333] hover:text-[#001F3F]"
                >
                  Voltar para Login do Profissional
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
