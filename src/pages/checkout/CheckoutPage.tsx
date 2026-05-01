import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Check, Tag, QrCode, Barcode, CreditCard, Globe, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

const guestSchema = z
  .object({
    nome_completo: z.string().min(5, 'O nome deve ter pelo menos 5 caracteres').max(150),
    cpf_cnpj: z
      .string()
      .regex(
        /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/,
        'Use 123.456.789-00 ou 12.345.678/0001-90',
      ),
    telefone: z.string().regex(/^\d{2} \d{4,5}-\d{4}$/, 'Use 11 99999-9999'),
    email: z.string().email('Email inválido'),
    confirm_email: z.string().email('Email inválido'),
  })
  .refine((data) => data.email === data.confirm_email, {
    message: 'Os emails não correspondem',
    path: ['confirm_email'],
  })

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
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [guestData, setGuestData] = useState<z.infer<typeof guestSchema> | null>(null)
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false)

  const { toast } = useToast()
  const navigate = useNavigate()
  const section2Ref = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const form = useForm<z.infer<typeof guestSchema>>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      nome_completo: '',
      cpf_cnpj: '',
      telefone: '',
      email: '',
      confirm_email: '',
    },
  })

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
            className: 'bg-[#10B981] text-white border-none',
          })
          setError(null)
          return
        }
        setError('Cupom inválido ou expirado')
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Cupom inválido ou expirado.',
        })
        return
      }

      if (new Date(data.data_fim) < new Date()) {
        setError('Cupom inválido ou expirado')
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
        className: 'bg-[#10B981] text-white border-none',
      })
    } catch (err) {
      console.error(err)
      setError('Erro ao validar cupom')
    }
  }

  const handleCheckout = async (finalGuestData?: z.infer<typeof guestSchema>) => {
    if (!user && !finalGuestData) {
      setShowGuestModal(true)
      return
    }

    setIsProcessingCheckout(true)
    toast({
      title: 'Processando pagamento...',
      description: 'Aguarde enquanto preparamos seu ambiente.',
    })

    const payload = {
      user_id: user?.id || null,
      guest_dados: finalGuestData || null,
      plano: selectedPlan?.name,
      metodo_pagamento: paymentMethod,
      cupom_codigo: appliedCoupon?.code || null,
    }

    if (paymentMethod === 'cartao_internacional') {
      try {
        const { data, error } = await supabase.functions.invoke('gerar-sessao-stripe', {
          body: payload,
        })

        if (error) throw new Error(error.message || 'Erro ao comunicar com o servidor')
        if (data?.error) throw new Error(data.error)

        if (data?.checkout_url) {
          window.location.href = data.checkout_url
        }
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Erro no pagamento',
          description:
            err.message || 'Não foi possível gerar a sessão de pagamento. Tente novamente.',
        })
      }
    } else {
      try {
        const { data, error } = await supabase.functions.invoke('gerar-link-infinitypay', {
          body: payload,
        })

        if (error) {
          throw new Error(error.message || 'Erro ao comunicar com o servidor')
        }

        if (data?.error) {
          throw new Error(data.error)
        }

        if (data?.checkout_url) {
          window.location.href = data.checkout_url
        }
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Erro no pagamento',
          description:
            err.message || 'Não foi possível gerar o link de pagamento. Tente novamente.',
        })
      }
    }
    setIsProcessingCheckout(false)
  }

  const onSubmitGuest = (data: z.infer<typeof guestSchema>) => {
    setGuestData(data)
    setShowGuestModal(false)
    handleCheckout(data)
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
    <div className="min-h-screen bg-gradient-to-b from-[#2A4365] to-[#1E3A8A] text-slate-100 selection:bg-[#B8860B]/30 font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-16 pb-24">
        {/* Header */}
        <div className="text-center space-y-6 animate-in fade-in duration-700 pt-8">
          <h2 className="text-5xl md:text-6xl font-display font-bold tracking-widest text-[#B8860B] uppercase drop-shadow-sm">
            Kronos Gest
          </h2>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Escolha seu Plano</h1>
          <p className="text-xl text-[#3B82F6] font-medium">
            Potencialize sua clínica com a melhor tecnologia
          </p>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[450px] w-full rounded-2xl bg-white/10" />
              ))
            : plans.map((plan, i) => (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative overflow-hidden bg-white text-slate-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer animate-in fade-in slide-in-from-bottom-8 flex flex-col border-2',
                    selectedPlan?.id === plan.id
                      ? 'border-[#B8860B] shadow-[0_0_25px_rgba(184,134,11,0.3)] ring-4 ring-[#B8860B]/10 z-10'
                      : 'border-transparent shadow-lg',
                  )}
                  style={{ animationDelay: `${i * 150}ms` }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {selectedPlan?.id === plan.id && (
                    <div className="absolute top-0 right-0 bg-[#B8860B] text-white px-4 py-1.5 rounded-bl-xl text-sm font-bold shadow-sm z-10 uppercase tracking-wide">
                      Selecionado
                    </div>
                  )}
                  <CardHeader className="text-center pb-4 pt-8">
                    <CardTitle className="text-3xl font-display font-bold text-[#B8860B]">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-6">
                      <span className="text-5xl font-extrabold text-[#1E3A8A]">
                        R$ {plan.price}
                      </span>
                      <span className="text-slate-500 font-medium">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 px-8">
                    <ul className="space-y-4">
                      {plan.benefits.map((benefit, j) => (
                        <li key={j} className="flex items-start text-base text-slate-600">
                          <Check className="h-6 w-6 text-[#10B981] mr-3 shrink-0" />
                          <span className="leading-tight">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto p-8 pt-0">
                    <Button
                      className={cn(
                        'w-full py-6 text-lg font-semibold transition-all duration-300 rounded-xl',
                        selectedPlan?.id === plan.id
                          ? 'bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:opacity-90 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-[#1E3A8A]',
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
          <div className="text-center py-16 animate-in fade-in duration-700">
            <div className="inline-flex items-center justify-center p-5 bg-[#B8860B]/10 rounded-full mb-6 ring-1 ring-[#B8860B]/30">
              <AlertCircle className="h-10 w-10 text-[#B8860B]" />
            </div>
            <h3 className="text-2xl font-display font-medium text-[#B8860B]">
              Escolha um plano para começar
            </h3>
            <p className="text-slate-300 mt-3 text-lg">
              Selecione uma das opções acima para prosseguir com sua assinatura.
            </p>
          </div>
        )}

        {selectedPlan && (
          <div
            ref={section2Ref}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-12 animate-in slide-in-from-bottom-12 duration-700"
          >
            <div className="lg:col-span-2 space-y-10">
              {/* Cupom */}
              <Card className="bg-white text-slate-900 border-none shadow-xl transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                  <CardTitle className="text-2xl text-[#B8860B] font-display">
                    Cupom de Desconto
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-base">
                    Tem um cupom?
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-[#B8860B] transition-colors" />
                      <Input
                        className="pl-12 h-14 text-lg border-2 border-slate-200 rounded-xl transition-colors focus-visible:ring-0 focus-visible:border-[#B8860B]"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <Button
                      onClick={applyCoupon}
                      variant="outline"
                      className="shrink-0 h-14 px-8 border-2 border-[#1E3A8A] text-[#1E3A8A] font-semibold text-lg hover:bg-[#1E3A8A] hover:text-white transition-all duration-300 rounded-xl"
                    >
                      Aplicar Cupom
                    </Button>
                  </div>
                  {error && (
                    <div className="mt-4 flex items-center justify-between animate-in fade-in">
                      <p className="text-base text-red-500 font-medium">{error}</p>
                      <Button
                        variant="link"
                        className="text-[#1E3A8A] font-semibold p-0 h-auto"
                        onClick={applyCoupon}
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="mt-4 p-4 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20 flex items-center animate-in slide-in-from-top-2">
                      <div className="bg-[#10B981] p-1.5 rounded-full mr-3">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-base text-[#10B981] font-semibold">
                        Cupom {appliedCoupon.code} aplicado com sucesso!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pagamento */}
              <Card className="bg-white text-slate-900 border-none shadow-xl transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                  <CardTitle className="text-2xl text-[#B8860B] font-display">
                    Método de Pagamento
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-base">
                    Escolha como deseja pagar sua assinatura.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <Tabs value={paymentTab} onValueChange={setPaymentTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1.5 rounded-xl">
                      <TabsTrigger
                        value="brasil"
                        className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white rounded-lg text-base py-3 transition-all duration-300 font-medium"
                        onClick={() => setPaymentMethod(null)}
                      >
                        Brasil
                      </TabsTrigger>
                      <TabsTrigger
                        value="internacional"
                        className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white rounded-lg text-base py-3 transition-all duration-300 font-medium"
                        onClick={() => setPaymentMethod(null)}
                      >
                        Internacional
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="brasil" className="space-y-8 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                          {
                            id: 'pix',
                            name: 'Pix',
                            description: 'Pagamento instantâneo',
                            icon: QrCode,
                            colorClass: 'text-[#10B981]',
                            hoverBg: 'hover:bg-[#10B981]/5',
                          },
                          {
                            id: 'boleto',
                            name: 'Boleto',
                            description: 'Até 3 dias úteis',
                            icon: Barcode,
                            colorClass: 'text-[#3B82F6]',
                            hoverBg: 'hover:bg-[#3B82F6]/5',
                          },
                          {
                            id: 'cartao',
                            name: 'Cartão de Crédito',
                            description: 'Aprovação na hora',
                            icon: CreditCard,
                            colorClass: 'text-[#B8860B]',
                            hoverBg: 'hover:bg-[#B8860B]/5',
                          },
                        ].map((method) => (
                          <div
                            key={method.id}
                            className={cn(
                              'flex flex-col items-center justify-center p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center',
                              paymentMethod === method.id
                                ? 'border-[#B8860B] bg-slate-50 shadow-md ring-4 ring-[#B8860B]/10'
                                : `border-slate-100 bg-white ${method.hoverBg} hover:border-slate-200`,
                            )}
                            onClick={() => setPaymentMethod(method.id)}
                          >
                            <method.icon
                              className={cn(
                                'h-12 w-12 mb-4 transition-transform duration-300',
                                paymentMethod === method.id
                                  ? `scale-110 ${method.colorClass}`
                                  : 'scale-100 text-slate-400',
                              )}
                            />
                            <span className="font-bold text-slate-800 text-lg">{method.name}</span>
                            <span className="text-sm text-slate-500 mt-2 font-medium">
                              {method.description}
                            </span>
                          </div>
                        ))}
                      </div>

                      {paymentMethod === 'pix' && (
                        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center animate-in slide-in-from-top-4">
                          <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                            <QrCode className="h-32 w-32 text-slate-800" />
                          </div>
                          <p className="font-bold text-lg text-slate-800">
                            Escaneie o QR code para pagar
                          </p>
                          <p className="text-base text-slate-500 mt-2">
                            A aprovação é instantânea.
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'boleto' && (
                        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center animate-in slide-in-from-top-4">
                          <div className="bg-[#3B82F6]/10 p-5 rounded-full mb-6">
                            <Barcode className="h-16 w-16 text-[#3B82F6]" />
                          </div>
                          <p className="font-bold text-lg text-slate-800">
                            Boleto gerado com sucesso
                          </p>
                          <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 break-all font-mono text-base max-w-full shadow-sm text-slate-600">
                            00000.00000 00000.000000 00000.000000 0 00000000000000
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'cartao' && (
                        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-6 animate-in slide-in-from-top-4">
                          <div className="space-y-3">
                            <Label className="text-slate-700 font-semibold text-sm">
                              Número do Cartão
                            </Label>
                            <Input
                              placeholder=""
                              className="h-12 border-slate-200 focus-visible:ring-[#B8860B] rounded-xl text-lg"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-slate-700 font-semibold text-sm">
                                Validade
                              </Label>
                              <Input
                                placeholder=""
                                className="h-12 border-slate-200 focus-visible:ring-[#B8860B] rounded-xl text-lg"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-slate-700 font-semibold text-sm">CVV</Label>
                              <Input
                                placeholder=""
                                className="h-12 border-slate-200 focus-visible:ring-[#B8860B] rounded-xl text-lg"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label className="text-slate-700 font-semibold text-sm">
                              Nome no Cartão
                            </Label>
                            <Input
                              placeholder=""
                              className="h-12 border-slate-200 focus-visible:ring-[#B8860B] rounded-xl text-lg"
                            />
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="internacional" className="space-y-8 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div
                          className={cn(
                            'flex flex-col items-center justify-center p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center',
                            paymentMethod === 'cartao_internacional'
                              ? 'border-[#B8860B] bg-slate-50 shadow-md ring-4 ring-[#B8860B]/10'
                              : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200',
                          )}
                          onClick={() => setPaymentMethod('cartao_internacional')}
                        >
                          <Globe
                            className={cn(
                              'h-12 w-12 mb-4 transition-transform duration-300',
                              paymentMethod === 'cartao_internacional'
                                ? 'scale-110 text-[#6366F1]'
                                : 'scale-100 text-slate-400',
                            )}
                          />
                          <span className="font-bold text-slate-800 text-lg">
                            Cartão de Crédito (Stripe)
                          </span>
                          <span className="text-sm text-slate-500 mt-2 font-medium">
                            Cartão internacional
                          </span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Resumo */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 border-none shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-700 bg-gradient-to-br from-[#1E3A8A] to-[#B8860B] rounded-2xl">
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <CardHeader className="pb-6 pt-8 px-8">
                    <CardTitle className="text-3xl font-display text-white drop-shadow-md">
                      Resumo do Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 px-8">
                    <div className="flex justify-between items-center py-4 border-b border-white/20">
                      <span className="text-white/90 text-lg font-medium">
                        Plano {selectedPlan.name}
                      </span>
                      <span className="font-bold text-xl text-white">
                        R$ {selectedPlan.price.toFixed(2)}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center py-4 border-b border-white/20 text-[#10B981] animate-in slide-in-from-top-2">
                        <span className="flex items-center font-bold text-lg drop-shadow-sm">
                          <Tag className="h-5 w-5 mr-2" /> Desconto ({appliedCoupon.code})
                        </span>
                        <span className="font-bold text-xl drop-shadow-sm">
                          - R${' '}
                          {appliedCoupon.type === 'percent'
                            ? (selectedPlan.price * (appliedCoupon.discount / 100)).toFixed(2)
                            : appliedCoupon.discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-6 animate-in slide-in-from-bottom-4 duration-500">
                      <span className="text-2xl font-medium text-white/90">Total</span>
                      <span className="text-5xl font-extrabold text-white transition-all duration-300 drop-shadow-lg tracking-tight">
                        R$ {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 text-right font-medium">
                      Cobrado mensalmente
                    </p>
                  </CardContent>
                  <CardFooter className="p-8 pt-4">
                    <Button
                      className={cn(
                        'w-full py-8 text-xl font-bold transition-all duration-300 rounded-xl relative overflow-hidden group',
                        !selectedPlan || !paymentMethod
                          ? 'opacity-50 cursor-not-allowed bg-white/20 text-white hover:bg-white/20'
                          : 'bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:opacity-100 shadow-[0_0_20px_rgba(184,134,11,0.5)] hover:shadow-[0_0_35px_rgba(184,134,11,0.8)] text-[#1E3A8A]',
                      )}
                      disabled={!selectedPlan || !paymentMethod || isProcessingCheckout}
                      onClick={() => handleCheckout()}
                    >
                      {(!selectedPlan || !paymentMethod) && <span>Prosseguir para Pagamento</span>}
                      {selectedPlan && paymentMethod && !isProcessingCheckout && (
                        <>
                          <span className="relative z-10">Prosseguir para Pagamento</span>
                          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </>
                      )}
                      {isProcessingCheckout && <span>Processando...</span>}
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Modal Guest Checkout */}
        <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#1E3A8A] font-display font-bold">
                Dados para Emissão de Nota Fiscal
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-base">
                Preencha os dados abaixo para continuar
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitGuest)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="nome_completo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-semibold">Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="João Silva Santos"
                          className="focus-visible:ring-[#1E3A8A]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf_cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-semibold">CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123.456.789-00 ou 12.345.678/0001-90"
                          className="focus-visible:ring-[#1E3A8A]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-semibold">Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="11 99999-9999"
                          className="focus-visible:ring-[#1E3A8A]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
                          className="focus-visible:ring-[#1E3A8A]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-semibold">
                        Confirmar Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
                          className="focus-visible:ring-[#1E3A8A]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto"
                  >
                    Fazer Login
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-[#B8860B] hover:bg-[#DAA520] text-white font-semibold"
                    disabled={!form.formState.isValid}
                  >
                    Continuar para Pagamento
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
