import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stethoscope, Loader2, ArrowLeft } from 'lucide-react'

export default function ProfissionalLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message || 'Credenciais inválidas.')
      setLoading(false)
    } else {
      navigate('/')
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
            <Stethoscope className="w-10 h-10 text-[#C5A059]" />
          </div>
          <h1 className="text-2xl font-light text-[#FDFCF0] mb-2 tracking-wide">
            Acesso Profissional
          </h1>
        </div>

        <Card className="border-0 shadow-2xl bg-[#FFFFFF] rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="text-xl text-[#001F3F] text-center font-bold">
              Seu Consultório Virtual
            </CardTitle>
            {error && (
              <CardDescription className="text-destructive text-center font-medium mt-4 bg-destructive/10 py-3 rounded-lg">
                {error}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#001F3F] font-semibold text-sm">
                  E-mail Profissional
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-visible:ring-[#C5A059] h-12 bg-gray-50/50 border-gray-200"
                  placeholder="dr.nome@clinica.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#001F3F] font-semibold text-sm">
                    Senha
                  </Label>
                  <a href="#" className="text-xs font-medium text-[#C5A059] hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-visible:ring-[#C5A059] h-12 bg-gray-50/50 border-gray-200"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C5A059] hover:bg-[#A88640] text-[#FFFFFF] font-bold h-12 text-base transition-colors rounded-xl mt-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Acessar Consultório
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
