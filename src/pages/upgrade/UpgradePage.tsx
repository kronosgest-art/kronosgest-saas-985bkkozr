import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Crown, CheckCircle2 } from 'lucide-react'

export default function UpgradePage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 shadow-inner">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Faça Upgrade para Premium</CardTitle>
          <CardDescription className="text-base">
            Seu período de teste gratuito acabou ou está próximo do fim. Desbloqueie todo o poder do
            KronosGest para sua clínica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">
              O que você ganha no plano Premium:
            </h3>
            <ul className="space-y-3">
              {[
                'Acesso ilimitado a todos os recursos',
                'Análise avançada de exames com IA',
                'Geração inteligente de prescrições',
                'Suporte prioritário especializado',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button
            className="w-full text-base h-12 shadow-md transition-all hover:scale-[1.02]"
            size="lg"
          >
            Assinar Plano Premium
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
