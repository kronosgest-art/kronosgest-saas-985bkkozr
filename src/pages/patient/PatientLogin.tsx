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
        .from('pacientes')
        .select('*')
        .eq('email', email)
        .eq('cpf', cleanCpf)
        .single()

      if (error || !data) {
        toast({
          title: 'Acesso Negado',
          description: 'Email ou CPF incorretos. Tente novamente.',
          variant: 'destructive',
        })
      } else {
        localStorage.setItem('patient_session', JSON.stringify(data))
        toast({ title: 'Bem-vindo(a)', description: `Olá, ${data.nome_completo}!` })
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
        <CardHeader className="text-center bg-[#001F3F] text-white rounded-t-xl">
          <CardTitle className="text-2xl text-[#C5A059]">Portal do Paciente</CardTitle>
          <CardDescription className="text-gray-300">
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
                Senha (Seu CPF, apenas números)
              </Label>
              <Input
                id="cpf"
                type="password"
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="focus-visible:ring-[#C5A059]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#A88640] text-[#333333] font-bold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
