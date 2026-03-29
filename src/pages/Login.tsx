import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signIn, user, loading: authLoading } = useAuth()

  // Redirecionamento declarativo se o usuário já possuir sessão ativa
  if (!authLoading && user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

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
    <div className="flex h-screen w-full items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md animate-fade-in-up shadow-lg border-primary/10">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-4xl font-bold tracking-tight text-primary">
            KronosGest
          </CardTitle>
          <CardDescription className="text-base">
            Entre com suas credenciais para acessar a plataforma.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium animate-fade-in">
                {error}
              </div>
            )}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="font-semibold text-foreground/80">
                E-mail de acesso
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
            <div className="space-y-2.5">
              <Label htmlFor="password" className="font-semibold text-foreground/80">
                Senha segura
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
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
    </div>
  )
}
