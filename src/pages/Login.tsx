import { useNavigate } from 'react-router-dom'
import useAuthStore, { Role } from '@/stores/useAuthStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = (role: Role) => {
    login(role)
    navigate('/')
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
          >
            Acesso Admin Global
          </Button>
          <Button
            className="w-full h-12 text-lg group hover:scale-[1.02] transition-transform"
            variant="secondary"
            onClick={() => handleLogin('clinic')}
          >
            Acesso Clínica / Profissional
          </Button>
          <Button
            className="w-full h-12 text-lg group hover:scale-[1.02] transition-transform"
            variant="outline"
            onClick={() => handleLogin('patient')}
          >
            Portal do Paciente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
