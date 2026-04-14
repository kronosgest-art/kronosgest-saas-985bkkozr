import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, Crown, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UpgradePage() {
  const location = useLocation()
  const reason = (location.state as any)?.reason || 'Seu acesso requer uma assinatura ativa.'

  const plans = [
    {
      name: 'Básico',
      price: 'R$ 99',
      period: '/mês',
      description: 'Essencial para organizar sua clínica',
      icon: Zap,
      features: [
        'Gestão de pacientes básica',
        'Até 50 agendamentos por mês',
        'Prontuário eletrônico',
        'Suporte por email',
      ],
      popular: false,
    },
    {
      name: 'Profissional',
      price: 'R$ 199',
      period: '/mês',
      description: 'Perfeito para clínicas em crescimento',
      icon: Sparkles,
      features: [
        'Tudo do plano Básico',
        'Agendamentos ilimitados',
        'Protocolos personalizados',
        'Integração Google Calendar',
        'Gestão financeira avançada',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: 'R$ 299',
      period: '/mês',
      description: 'O poder máximo da IA para sua prática',
      icon: Crown,
      features: [
        'Tudo do plano Profissional',
        'Análise de exames com IA',
        'Geração de prescrições inteligentes',
        'Sugestão de suplementação avançada',
        'Suporte prioritário WhatsApp',
      ],
      popular: false,
    },
  ]

  const handleCheckout = (planName: string) => {
    // Integração com Stripe ou gateway de pagamento no futuro
    console.log(`Iniciando checkout para o plano: ${planName}`)
    alert(`Integração de pagamento para o plano ${planName} em breve.`)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-6 shadow-sm border border-red-100">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#001F3F] mb-4">
          Acesso Interrompido
        </h1>
        <p className="text-xl text-muted-foreground font-medium mb-2">{reason}</p>
        <p className="text-base text-muted-foreground/80">
          Escolha um plano abaixo para liberar seu acesso imediatamente e continuar evoluindo sua
          clínica.
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        {plans.map((plan, index) => {
          const Icon = plan.icon
          return (
            <Card
              key={index}
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:shadow-xl',
                plan.popular
                  ? 'border-primary/50 shadow-lg md:-mt-4 md:mb-4 bg-[#FDFCF0]'
                  : 'border-border/50',
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                    Mais Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div
                  className={cn(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4',
                    plan.popular ? 'bg-[#001F3F] text-[#C5A059]' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="h-10 flex items-center justify-center mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-[#001F3F]">
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className={cn(
                          'h-5 w-5 shrink-0 mt-0.5',
                          plan.popular ? 'text-[#C5A059]' : 'text-green-500',
                        )}
                      />
                      <span className="text-sm font-medium text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6 pb-8">
                <Button
                  className={cn(
                    'w-full text-base h-12 shadow-sm transition-all hover:scale-[1.02]',
                    plan.popular ? 'bg-[#001F3F] hover:bg-[#001F3F]/90 text-white' : '',
                  )}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleCheckout(plan.name)}
                >
                  Escolher Plano {plan.name}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
