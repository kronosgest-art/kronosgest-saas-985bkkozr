import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { User, Loader2, ArrowLeft } from 'lucide-react'

export default function PatientLogin() {
  const [email, setEmail] = useState('marcelus@kronosgest.com')
  const [cpf, setCpf] = useState('12345678900')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const cleanCpf = cpf.replace(/\D/g, '')
      const { error: signInError } = await signIn(email, cleanCpf)

      if (signInError) {
        setError('E-mail ou CPF inválidos. Verifique seus dados e tente novamente.')
      } else {
        toast({ title: 'Bem-vindo(a)', description: 'Acesso ao portal realizado com sucesso!' })
        navigate('/')
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001F3F] px-4 py-8 font-sans relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#C5A059]/5 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-[#FFFFFF] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(197,160,89,0.15)]">
            <User className="w-10 h-10 text-[#C5A059]" />
          </div>
          <h1 className="text-2xl font-light text-[#FDFCF0] mb-2 tracking-wide">
            Portal do Paciente
          </h1>
        </div>

        <Card className="border-0 shadow-2xl bg-[#FFFFFF] rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="text-xl text-[#001F3F] text-center font-bold">
              Seus Dados de Acesso
            </CardTitle>
            {error && (
              <CardDescription className="text-destructive text-center font-medium mt-4 bg-destructive/10 py-3 rounded-lg">
                {error}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-2">
            {/* Credenciais Box */}
            <div className="mb-6 p-4 rounded-xl bg-[#FDFCF0] border border-[#C5A059]/20 flex flex-col items-center justify-center text-sm shadow-sm">
              <span className="text-[#C5A059] font-bold mb-2 uppercase tracking-wider text-xs">
                Credenciais de Teste
              </span>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[#333333] text-left w-full max-w-[280px]">
                <span className="text-right text-[#001F3F]/60 font-medium">Login:</span>
                <span className="font-mono font-medium text-[#001F3F]">
                  marcelus@kronosgest.com
                </span>
                <span className="text-right text-[#001F3F]/60 font-medium">Senha:</span>
                <span className="font-mono font-medium text-[#001F3F]">12345678900</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#001F3F] font-semibold text-sm">
                  E-mail Cadastrado
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-visible:ring-[#C5A059] h-12 bg-gray-50/50 border-gray-200"
                  placeholder="seu.email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cpf" className="text-[#001F3F] font-semibold text-sm">
                    Senha de Acesso (CPF)
                  </Label>
                </div>
                <Input
                  id="cpf"
                  type="password"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="Apenas números"
                  className="focus-visible:ring-[#C5A059] h-12 bg-gray-50/50 border-gray-200"
                />
                <p className="text-xs text-[#333333]/70 pt-1">
                  Sua senha inicial é o seu CPF sem pontos ou traços.
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C5A059] hover:bg-[#A88640] text-[#FFFFFF] font-bold h-12 text-base transition-colors rounded-xl mt-4"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Acessar Portal
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-[#FDFCF0]/70 hover:text-[#FFFFFF] hover:bg-white/10 rounded-full px-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Seleção
          </Button>
        </div>
      </div>
    </div>
  )
}
