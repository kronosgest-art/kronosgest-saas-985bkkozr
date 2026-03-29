import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Login() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const [loadingRole, setLoadingRole] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleLogin = async (role: 'admin' | 'clinic' | 'patient') => {
    setLoadingRole(role)

    let email = ''
    if (role === 'admin') email = 'admin@kronosgest.com'
    if (role === 'clinic') email = 'dra.morganavieira@gmail.com'
    if (role === 'patient') email = 'patient@kronosgest.com'

    const { error } = await signIn(email, 'securepassword123')

    if (error) {
      toast({ title: 'Erro de Autenticação', description: error.message, variant: 'destructive' })
      setLoadingRole(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">KronosGest SaaS</CardTitle>
            <CardDescription className="text-base mt-2">
              Selecione seu perfil de acesso para entrar na plataforma.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Button
            className="w-full h-12 text-lg group hover:scale-[1.02] transition-transform"
            onClick={() => handleLogin('admin')}
            disabled={loadingRole !== null}
          >
            {loadingRole === 'admin' ? 'Entrando...' : 'Acesso Admin Global'}
          </Button>
          <Button
            className="w-full h-12 text-lg group hover:scale-[1.02] transition-transform"
            variant="secondary"
            onClick={() => handleLogin('clinic')}
            disabled={loadingRole !== null}
          >
            {loadingRole === 'clinic' ? 'Entrando...' : 'Acesso Clínica / Profissional'}
          </Button>
          <Button
            className="w-full h-12 text-lg group hover:scale-[1.02] transition-transform"
            variant="outline"
            onClick={() => handleLogin('patient')}
            disabled={loadingRole !== null}
          >
            {loadingRole === 'patient' ? 'Entrando...' : 'Portal do Paciente'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
