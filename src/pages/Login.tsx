import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, Building, User } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessType, setAccessType] = useState<string>('admin')

  const { signIn, user, loading: authLoading } = useAuth()

  useEffect(() => {
    const savedType = localStorage.getItem('kronosgest_access_type')
    if (savedType) {
      setAccessType(savedType)
    }
  }, [])

  const handleAccessTypeChange = (value: string) => {
    setAccessType(value)
    localStorage.setItem('kronosgest_access_type', value)

    // Auto-preenche as senhas de teste para facilitar o processo
    if (value === 'admin') {
      setEmail('admin@kronosgest.com')
      setPassword('Admin@123456')
    } else if (value === 'clinica') {
      setEmail('clinica@kronosgest.com')
      setPassword('Clinica@123456')
    } else if (value === 'paciente') {
      setEmail('')
      setPassword('')
    }
  }

  useEffect(() => {
    const patientSession = localStorage.getItem('kronosgest_patient_session')
    if (patientSession && accessType === 'paciente') {
      navigate('/patient-dashboard')
    }
  }, [accessType, navigate])

  if (!authLoading && user && accessType !== 'paciente') {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (accessType === 'paciente') {
      try {
        const { data, error: dbError } = await supabase
          .from('pacientes_acesso')
          .select('*, pacientes(*)')
          .eq('email', email)
          .eq('cpf', password)
          .eq('ativo', true)

        if (dbError) throw dbError

        if (data && data.length > 0) {
          const acesso = data[0]

          localStorage.setItem(
            'kronosgest_patient_session',
            JSON.stringify({
              id: acesso.id,
              paciente_id: acesso.paciente_id,
              email: acesso.email,
              cpf: acesso.cpf,
              nome: acesso.pacientes?.nome_completo || 'Paciente',
            }),
          )

          navigate('/patient-dashboard')
        } else {
          setError('Email ou CPF inválidos.')
          setIsSubmitting(false)
        }
      } catch (err) {
        setError('Erro ao conectar. Tente novamente.')
        setIsSubmitting(false)
      }
      return
    }

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message || 'Erro ao processar login. Verifique suas credenciais.')
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-medium">Verificando segurança...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4 py-8">
      <div className="w-full max-w-md animate-fade-in-up space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-2 shadow-lg">
            <span className="text-2xl font-bold">IMV</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Instituto Morgana Vieira
          </h1>
          <p className="text-muted-foreground">Bem-vindo ao KronosGest SaaS</p>
        </div>

        <Card className="shadow-xl border-primary/10">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl">Acesse sua conta</CardTitle>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              <Tabs value={accessType} onValueChange={handleAccessTypeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                  <TabsTrigger value="clinica" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span className="hidden sm:inline">Clínica</span>
                  </TabsTrigger>
                  <TabsTrigger value="paciente" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Paciente</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-foreground/80">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@clinica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-semibold text-foreground/80">
                    {accessType === 'paciente' ? 'Senha (CPF apenas números)' : 'Senha'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                  <div className="flex justify-end pt-1">
                    {accessType === 'paciente' ? (
                      <span className="text-xs text-muted-foreground">
                        Sua senha é o seu CPF (apenas números).
                      </span>
                    ) : (
                      <a
                        href="#"
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#1E3A8A' }}
                      >
                        Recuperar Senha
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex flex-col gap-4">
              <Button
                type="submit"
                size="lg"
                className="w-full shadow-md text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Autenticando...' : 'Acessar o Painel'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-5 space-y-3 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground text-center">Credenciais de Teste</h3>
            <div className="grid gap-2">
              <div className="flex flex-col sm:flex-row sm:justify-between p-2.5 bg-background rounded-md border shadow-sm">
                <span className="font-medium flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" /> Admin
                </span>
                <span className="font-mono text-xs text-foreground/80 mt-1 sm:mt-0">
                  admin@kronosgest.com / Admin@123456
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between p-2.5 bg-background rounded-md border shadow-sm">
                <span className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" /> Clínica
                </span>
                <span className="font-mono text-xs text-foreground/80 mt-1 sm:mt-0">
                  clinica@kronosgest.com / Clinica@123456
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between p-2.5 bg-background rounded-md border shadow-sm">
                <span className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Paciente
                </span>
                <span className="font-mono text-xs text-foreground/80 mt-1 sm:mt-0">
                  Acesse com o e-mail e CPF cadastrados
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
