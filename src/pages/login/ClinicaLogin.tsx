import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Loader2, ArrowLeft } from 'lucide-react'

export default function ClinicaLogin() {
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

  const fillTestCredentials = () => {
    setEmail('clinica@kronosgest.com')
    setPassword('Clinica@123456')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0] px-4 py-8 font-sans">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-[#FDFCF0] rounded-2xl flex items-center justify-center mb-6 border-2 border-[#001F3F] shadow-lg">
            <Building2 className="w-10 h-10 text-[#001F3F]" />
          </div>
          <h1 className="text-3xl font-bold text-[#001F3F] mb-2 font-display">Acesso Clínica</h1>
          <p className="text-[#333333]">Gerenciamento corporativo da sua clínica</p>
        </div>

        <Card className="border-[#001F3F]/20 shadow-xl bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#001F3F] text-center">
              Credenciais da Clínica
            </CardTitle>
            {error && (
              <CardDescription className="text-destructive text-center font-medium mt-2 bg-destructive/10 py-2 rounded-md">
                {error}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#001F3F] font-semibold">
                  E-mail da Clínica
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-visible:ring-[#001F3F] h-11 border-[#001F3F]/20"
                  placeholder="contato@suaclinica.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#001F3F] font-semibold">
                    Senha
                  </Label>
                  <a href="#" className="text-sm font-medium text-[#C5A059] hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-visible:ring-[#001F3F] h-11 border-[#001F3F]/20"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#001F3F] hover:bg-[#00152b] text-[#FDFCF0] font-bold h-12 text-base transition-colors"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Acessar Plataforma
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-[#333333] hover:text-[#001F3F] hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Seleção de Acesso
          </Button>

          <div className="pt-8 text-xs text-[#333333]/60">
            <button
              onClick={fillTestCredentials}
              className="hover:text-[#001F3F] underline underline-offset-2"
            >
              Preencher credenciais de teste
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
