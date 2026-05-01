import { useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  CheckCircle2,
  AlertTriangle,
  Crown,
  Sparkles,
  Zap,
  Tag,
  CreditCard,
  QrCode,
  Barcode,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UpgradePage() {
  const location = useLocation()
  const reason = (location.state as any)?.reason

  const { toast } = useToast()

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)

  const checkoutRef = useRef<HTMLDivElement>(null)

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 99,
      priceLabel: 'R$ 99',
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
      id: 'pro',
      name: 'Profissional',
      price: 199,
      priceLabel: 'R$ 199',
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
      id: 'premium',
      name: 'Premium',
      price: 299,
      priceLabel: 'R$ 299',
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

  const handleSelectPlan = (id: string) => {
    setSelectedPlanId(id)
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return

    if (coupon.toUpperCase() === 'DESCONTO10') {
      setAppliedCoupon(coupon.toUpperCase())
      setDiscount(10)
      toast({
        title: 'Cupom aplicado!',
        description: 'Você ganhou R$ 10 de desconto.',
        className: 'bg-green-50 border-green-200 text-green-800',
      })
    } else {
      toast({
        title: 'Cupom inválido',
        description: 'Verifique o código digitado e tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleFinalize = () => {
    if (!paymentMethod) {
      toast({
        title: 'Selecione um método de pagamento',
        variant: 'destructive',
      })
      return
    }
    const planName = plans.find((p) => p.id === selectedPlanId)?.name
    console.log(`Iniciando checkout para o plano: ${planName} via ${paymentMethod}`)
    toast({
      title: 'Redirecionando para pagamento',
      description: `Processando assinatura do plano ${planName}...`,
    })
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const subtotal = selectedPlan?.price || 0
  const total = Math.max(0, subtotal - discount)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="text-center max-w-2xl mx-auto mb-14 animate-fade-in-up">
        {reason && (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6 shadow-sm border border-red-100">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#B8860B] mb-4 font-display">
          Evolua sua Clínica
        </h1>
        {reason ? (
          <p className="text-xl text-gray-700 font-medium mb-2">{reason}</p>
        ) : (
          <p className="text-xl text-[#3B82F6] font-medium mb-2">Escolha o plano ideal para você</p>
        )}
        <p className="text-base text-gray-600">
          Selecione uma de nossas opções abaixo e libere o poder máximo do KronosGest.
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        {plans.map((plan) => {
          const Icon = plan.icon
          const isSelected = selectedPlanId === plan.id
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer bg-white',
                isSelected
                  ? 'border-2 border-[#B8860B] shadow-xl ring-4 ring-[#B8860B]/10 z-10 scale-[1.02]'
                  : 'border-gray-200 shadow-sm hover:border-[#B8860B]/50',
              )}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {plan.popular && !isSelected && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#B8860B] text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
                    Mais Popular
                  </span>
                </div>
              )}
              {isSelected && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#B8860B] text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selecionado
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-10">
                <div
                  className={cn(
                    'mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-6 transition-colors duration-300',
                    isSelected
                      ? 'bg-[#B8860B] text-white'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-[#B8860B]/10 group-hover:text-[#B8860B]',
                  )}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-3xl font-bold text-[#B8860B] font-display">
                  {plan.name}
                </CardTitle>
                <CardDescription className="h-10 flex items-center justify-center mt-3 text-[#3B82F6] font-medium text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-8 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    {plan.priceLabel}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 px-8">
                <ul className="space-y-5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className={cn(
                          'h-5 w-5 shrink-0 mt-0.5 transition-colors duration-300',
                          isSelected ? 'text-[#B8860B]' : 'text-gray-400',
                        )}
                      />
                      <span className="text-sm font-medium text-gray-700 leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-8 pb-8 px-8">
                <Button
                  className={cn(
                    'w-full text-base h-14 shadow-sm transition-all duration-300 rounded-xl font-bold',
                    isSelected
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#B8860B] text-white hover:opacity-90 hover:shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-[#B8860B]',
                  )}
                  variant={isSelected ? 'default' : 'outline'}
                >
                  {isSelected ? 'Plano Selecionado' : `Escolher ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {selectedPlanId && (
        <div
          ref={checkoutRef}
          className="w-full max-w-6xl mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-24"
        >
          <div
            className="lg:col-span-2 space-y-8 animate-fade-in-up"
            style={{ animationDuration: '400ms' }}
          >
            <Card className="border-gray-200 shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-6">
                <CardTitle className="text-2xl font-bold text-[#B8860B] font-display">
                  Método de Pagamento
                </CardTitle>
                <CardDescription className="text-[#3B82F6] font-medium text-base">
                  Como você prefere pagar?
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <RadioGroup
                  value={paymentMethod || ''}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <Label
                    htmlFor="pix"
                    className={cn(
                      'flex flex-col items-center justify-center p-8 border-2 rounded-xl cursor-pointer transition-all duration-300 group',
                      paymentMethod === 'pix'
                        ? 'border-[#10B981] bg-[#10B981]/5 shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                    )}
                  >
                    <RadioGroupItem value="pix" id="pix" className="sr-only" />
                    <QrCode
                      className={cn(
                        'h-12 w-12 mb-4 transition-colors duration-300',
                        paymentMethod === 'pix'
                          ? 'text-[#10B981]'
                          : 'text-gray-400 group-hover:text-[#10B981]',
                      )}
                    />
                    <span
                      className={cn(
                        'font-bold text-lg',
                        paymentMethod === 'pix' ? 'text-[#10B981]' : 'text-gray-600',
                      )}
                    >
                      Pix
                    </span>
                  </Label>

                  <Label
                    htmlFor="credit_card"
                    className={cn(
                      'flex flex-col items-center justify-center p-8 border-2 rounded-xl cursor-pointer transition-all duration-300 group',
                      paymentMethod === 'credit_card'
                        ? 'border-[#B8860B] bg-[#B8860B]/5 shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                    )}
                  >
                    <RadioGroupItem value="credit_card" id="credit_card" className="sr-only" />
                    <CreditCard
                      className={cn(
                        'h-12 w-12 mb-4 transition-colors duration-300',
                        paymentMethod === 'credit_card'
                          ? 'text-[#B8860B]'
                          : 'text-gray-400 group-hover:text-[#B8860B]',
                      )}
                    />
                    <span
                      className={cn(
                        'font-bold text-lg',
                        paymentMethod === 'credit_card' ? 'text-[#B8860B]' : 'text-gray-600',
                      )}
                    >
                      Cartão
                    </span>
                  </Label>

                  <Label
                    htmlFor="boleto"
                    className={cn(
                      'flex flex-col items-center justify-center p-8 border-2 rounded-xl cursor-pointer transition-all duration-300 group',
                      paymentMethod === 'boleto'
                        ? 'border-[#3B82F6] bg-[#3B82F6]/5 shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                    )}
                  >
                    <RadioGroupItem value="boleto" id="boleto" className="sr-only" />
                    <Barcode
                      className={cn(
                        'h-12 w-12 mb-4 transition-colors duration-300',
                        paymentMethod === 'boleto'
                          ? 'text-[#3B82F6]'
                          : 'text-gray-400 group-hover:text-[#3B82F6]',
                      )}
                    />
                    <span
                      className={cn(
                        'font-bold text-lg',
                        paymentMethod === 'boleto' ? 'text-[#3B82F6]' : 'text-gray-600',
                      )}
                    >
                      Boleto
                    </span>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDuration: '500ms' }}>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-[#001F3F] to-[#003366] text-white relative overflow-hidden sticky top-24">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#3B82F6] via-[#B8860B] to-[#F4D068]"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B8860B] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

              <CardHeader className="pb-6 pt-8 px-8">
                <CardTitle className="text-2xl font-bold text-[#F4D068] font-display">
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-8 px-8">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white/90 font-medium">Plano {selectedPlan?.name}</span>
                  <span className="font-bold">R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="space-y-4">
                  <Label className="text-white/90 text-sm font-medium">Cupom de Desconto</Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1 group">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 transition-colors group-focus-within:text-[#F4D068]" />
                      <Input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Código do cupom"
                        className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#F4D068] focus-visible:border-transparent rounded-lg"
                        disabled={!!appliedCoupon}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleApplyCoupon}
                      disabled={!!appliedCoupon || !coupon.trim()}
                      className="h-12 px-6 bg-[#F4D068] text-[#001F3F] hover:bg-[#F4D068]/90 font-bold rounded-lg transition-all"
                    >
                      Aplicar
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center gap-2 text-sm text-[#10B981] bg-[#10B981]/10 px-3 py-2 rounded-md border border-[#10B981]/20 animate-fade-in">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">
                        Cupom aplicado! (-R$ {discount.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="bg-white/10" />

                <div className="flex justify-between items-end animate-fade-in-up">
                  <span className="text-white/90 text-xl font-medium">Total</span>
                  <span className="text-4xl font-extrabold text-[#F4D068]">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-4 pb-8 px-8">
                <Button
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#B8860B] hover:opacity-100 hover:shadow-[0_0_20px_rgba(184,134,11,0.4)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none text-white rounded-xl uppercase tracking-wide"
                  disabled={!paymentMethod}
                  onClick={handleFinalize}
                >
                  Finalizar Compra
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
