import { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Check, Tag, QrCode, Barcode, CreditCard, Globe, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    benefits: ['30 respostas WhatsApp/mês', '5 prescrições/mês', '1 profissional'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 199,
    benefits: ['300 respostas WhatsApp/mês', '50 prescrições/mês', '3 profissionais'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    benefits: ['1000 respostas WhatsApp/mês', '200 prescrições/mês', 'Profissionais ilimitados'],
  },
]

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount: number
    type: 'percent' | 'fixed'
  } | null>(null)
  const [paymentTab, setPaymentTab] = useState('brasil')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)

  const { toast } = useToast()
  const section2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleSelectPlan = (plan: (typeof plans)[0]) => {
    setSelectedPlan(plan)
    setTimeout(() => {
      section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const applyCoupon = async () => {
    if (!couponInput) return

    try {
      const { data, error } = await supabase
        .from('cupons')
        .select('*')
        .eq('codigo', couponInput.toUpperCase())
        .eq('status', 'ativo')
        .single()

      if (error || !data) {
        if (couponInput.toUpperCase() === 'PROMO20') {
          setAppliedCoupon({ code: 'PROMO20', discount: 20, type: 'percent' })
          toast({
            title: 'Cupom aplicado!',
            description: 'Você ganhou 20% de desconto.',
            className: 'bg-green-500 text-white border-none',
          })
          setError(null)
          return
        }
        setError('Cupom inválido ou expirado.')
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Cupom inválido ou expirado.',
        })
        return
      }

      if (new Date(data.data_fim) < new Date()) {
        setError('Cupom inválido ou expirado.')
        return
      }

      setError(null)
      setAppliedCoupon({
        code: data.codigo,
        discount: data.desconto_percentual || data.desconto_fixo || 0,
        type: data.desconto_percentual ? 'percent' : 'fixed',
      })
      toast({
        title: 'Cupom aplicado!',
        description: `Desconto aplicado com sucesso.`,
        className: 'bg-green-500 text-white border-none',
      })
    } catch (err) {
      console.error(err)
      setError('Erro ao validar cupom.')
    }
  }

  const handleCheckout = () => {
    toast({
      title: 'Processando pagamento...',
      description: 'Aguarde enquanto preparamos seu ambiente.',
    })
    setTimeout(() => {
      toast({
        title: 'Sucesso!',
        description: 'Plano assinado com sucesso. Bem-vindo ao KronosGest!',
        className: 'bg-green-500 text-white border-none',
      })
    }, 2000)
  }

  const calculateTotal = () => {
    if (!selectedPlan) return 0
    let total = selectedPlan.price
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        total = total * (1 - appliedCoupon.discount / 100)
      } else {
        total = Math.max(0, total - appliedCoupon.discount)
      }
    }
    return total
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4 animate-in fade-in duration-500">
        <h1 className="text-4xl font-bold text-[#B8860B]">Escolha seu Plano</h1>
        <p className="text-lg text-[#3B82F6]">Potencialize sua clínica com a melhor tecnologia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
            ))
          : plans.map((plan, i) => (
              <Card
                key={plan.id}
                className={cn(
                  'relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer animate-in fade-in slide-in-from-bottom-4',
                  selectedPlan?.id === plan.id
                    ? 'border-2 border-[#B8860B] shadow-lg ring-4 ring-[#B8860B]/20'
                    : 'border border-border',
                )}
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => handleSelectPlan(plan)}
              >
                {selectedPlan?.id === plan.id && (
                  <div className="absolute top-0 right-0 bg-[#B8860B] text-white px-3 py-1 rounded-bl-lg text-sm font-medium z-10">
                    Selecionado
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-[#1E3A8A]">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">R$ {plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {plan.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start text-sm text-muted-foreground">
                        <Check className="h-5 w-5 text-[#B8860B] mr-2 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button
                    className={cn(
                      'w-full transition-all',
                      selectedPlan?.id === plan.id
                        ? 'bg-[#B8860B] hover:bg-[#B8860B]/90 text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectPlan(plan)
                    }}
                  >
                    {selectedPlan?.id === plan.id ? 'Plano Selecionado' : 'Escolher Plano'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>

      {!selectedPlan && !loading && (
        <div className="text-center py-12 animate-in fade-in duration-500">
          <div className="inline-flex items-center justify-center p-4 bg-[#B8860B]/10 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-[#B8860B]" />
          </div>
          <h3 className="text-xl font-medium text-[#1E3A8A]">Escolha um plano para começar</h3>
          <p className="text-muted-foreground mt-2">
            Selecione uma das opções acima para prosseguir com sua assinatura.
          </p>
        </div>
      )}

      {selectedPlan && (
        <div
          ref={section2Ref}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 animate-in fade-in duration-500"
        >
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/50 shadow-sm transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-[#1E3A8A]">Cupom de Desconto</CardTitle>
                <CardDescription>
                  Tem um cupom? Insira abaixo para aplicar ao seu pedido.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 transition-colors focus-visible:ring-[#B8860B]"
                      placeholder="Ex: PROMO20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={applyCoupon}
                    variant="outline"
                    className="shrink-0 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors"
                  >
                    Aplicar Cupom
                  </Button>
                </div>
                {error && (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-[#1E3A8A] p-0 h-auto"
                      onClick={applyCoupon}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                )}
                {appliedCoupon && (
                  <p className="text-sm text-green-600 mt-2 font-medium flex items-center animate-in fade-in">
                    <Check className="h-4 w-4 mr-1" /> Cupom {appliedCoupon.code} aplicado com
                    sucesso!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-[#1E3A8A]">Método de Pagamento</CardTitle>
                <CardDescription>Escolha como deseja pagar sua assinatura.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentTab} onValueChange={setPaymentTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger
                      value="brasil"
                      className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white"
                    >
                      Brasil
                    </TabsTrigger>
                    <TabsTrigger
                      value="internacional"
                      className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white"
                    >
                      Internacional
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="brasil" className="space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          id: 'pix',
                          name: 'Pix',
                          description: 'Pagamento instantâneo',
                          icon: QrCode,
                          color: 'text-[#10B981]',
                          bgHover: 'hover:bg-[#10B981]/5',
                          borderActive: 'border-[#10B981] bg-[#10B981]/5 ring-2 ring-[#10B981]/20',
                        },
                        {
                          id: 'boleto',
                          name: 'Boleto',
                          description: 'Até 3 dias úteis',
                          icon: Barcode,
                          color: 'text-[#3B82F6]',
                          bgHover: 'hover:bg-[#3B82F6]/5',
                          borderActive: 'border-[#3B82F6] bg-[#3B82F6]/5 ring-2 ring-[#3B82F6]/20',
                        },
                        {
                          id: 'cartao',
                          name: 'Cartão de Crédito',
                          description: 'Aprovação na hora',
                          icon: CreditCard,
                          color: 'text-[#B8860B]',
                          bgHover: 'hover:bg-[#B8860B]/5',
                          borderActive: 'border-[#B8860B] bg-[#B8860B]/5 ring-2 ring-[#B8860B]/20',
                        },
                      ].map((method) => (
                        <div
                          key={method.id}
                          className={cn(
                            'flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center',
                            paymentMethod === method.id
                              ? method.borderActive
                              : `border-transparent bg-secondary/50 ${method.bgHover}`,
                          )}
                          onClick={() => setPaymentMethod(method.id)}
                        >
                          <method.icon
                            className={cn(
                              'h-10 w-10 mb-2 transition-transform duration-200',
                              method.color,
                              paymentMethod === method.id ? 'scale-110' : 'scale-100',
                            )}
                          />
                          <span className="font-medium text-sm">{method.name}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {method.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="internacional" className="space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        className={cn(
                          'flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center',
                          paymentMethod === 'stripe'
                            ? 'border-[#635BFF] bg-[#635BFF]/5 ring-2 ring-[#635BFF]/20'
                            : 'border-transparent bg-secondary/50 hover:bg-[#635BFF]/5',
                        )}
                        onClick={() => setPaymentMethod('stripe')}
                      >
                        <Globe
                          className={cn(
                            'h-10 w-10 mb-2 transition-transform duration-200 text-[#635BFF]',
                            paymentMethod === 'stripe' ? 'scale-110' : 'scale-100',
                          )}
                        />
                        <span className="font-medium text-sm">Cartão de Crédito (Stripe)</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Cartão internacional
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-xl bg-gradient-to-br from-[#1E3A8A]/5 to-[#B8860B]/5 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1E3A8A] to-[#B8860B]"></div>
              <CardHeader>
                <CardTitle className="text-xl text-[#1E3A8A]">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Plano {selectedPlan.name}</span>
                  <span className="font-medium">R$ {selectedPlan.price.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50 text-green-600 animate-in fade-in">
                    <span className="flex items-center font-medium">
                      <Tag className="h-3 w-3 mr-1" /> Desconto ({appliedCoupon.code})
                    </span>
                    <span className="font-bold">
                      - R${' '}
                      {appliedCoupon.type === 'percent'
                        ? (selectedPlan.price * (appliedCoupon.discount / 100)).toFixed(2)
                        : appliedCoupon.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-medium text-[#1E3A8A]">Total</span>
                  <span className="text-4xl font-bold text-[#B8860B] transition-all duration-300">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right">Cobrado mensalmente</p>
              </CardContent>
              <CardFooter>
                <Button
                  className={cn(
                    'w-full py-6 text-lg font-medium text-white transition-all duration-300',
                    !selectedPlan || !paymentMethod
                      ? 'opacity-50 cursor-not-allowed bg-gray-400'
                      : 'bg-gradient-to-r from-[#1E3A8A] to-[#B8860B] hover:opacity-90 shadow-lg hover:shadow-[#B8860B]/20',
                  )}
                  disabled={!selectedPlan || !paymentMethod}
                  onClick={handleCheckout}
                >
                  Prosseguir para Pagamento
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
