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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Check, Tag, Barcode, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

const guestSchema = z
  .object({
    nome_completo: z.string().min(5, 'Nome deve ter pelo menos 5 caracteres'),
    cpf_cnpj: z.string().min(11, 'Preencha corretamente'),
    telefone: z.string().min(10, 'Preencha corretamente'),
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
    benefits: ['1000 respostas WhatsApp/mês', '200 prescrições/mês', 'Ilimitados'],
  },
]

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null)
  const [couponInput, setCouponInput] = useState('')
  const [showCoupon, setShowCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('cartao')
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()
  const section2Ref = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof guestSchema>>({
    resolver: zodResolver(guestSchema),
    defaultValues: { nome_completo: '', cpf_cnpj: '', telefone: '', email: '', confirm_email: '' },
  })

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  const applyCoupon = async () => {
    if (!couponInput) return
    const { data } = await supabase
      .from('cupons')
      .select('*')
      .eq('codigo', couponInput.toUpperCase())
      .eq('status', 'ativo')
      .single()

    if (data && new Date(data.data_fim) >= new Date()) {
      setAppliedCoupon({
        code: data.codigo,
        discount: data.desconto_percentual || data.desconto_fixo || 0,
        type: data.desconto_percentual ? 'percent' : 'fixed',
      })
      toast({
        title: 'Cupom aplicado com sucesso!',
        className: 'bg-green-600 text-white border-none',
      })
      setCouponInput('')
      setShowCoupon(false)
    } else {
      toast({ variant: 'destructive', title: 'Cupom inválido ou expirado' })
    }
  }

  const handleCheckout = async (finalData?: any) => {
    if (!user && !finalData) {
      setShowGuestModal(true)
      return
    }
    setIsProcessing(true)
    try {
      const payload = {
        user_id: user?.id,
        guest_dados: finalData,
        plano: selectedPlan?.name,
        metodo_pagamento: paymentMethod,
        cupom_codigo: appliedCoupon?.code,
        origin: window.location.origin,
      }
      const { data, error } = await supabase.functions.invoke('gerar-sessao-stripe', {
        body: payload,
      })
      if (error || data?.error) throw new Error(data?.error || error?.message)
      if (data?.checkout_url) window.location.href = data.checkout_url
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro no pagamento', description: err.message })
    }
    setIsProcessing(false)
  }

  const calculateTotal = () => {
    if (!selectedPlan) return 0
    let total = selectedPlan.price
    if (appliedCoupon) {
      total =
        appliedCoupon.type === 'percent'
          ? total * (1 - appliedCoupon.discount / 100)
          : Math.max(0, total - appliedCoupon.discount)
    }
    return total
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A4365] to-[#1E3A8A] text-slate-100 font-sans pb-24">
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-16">
        <div className="text-center space-y-4 pt-8 animate-in fade-in">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-wider text-[#B8860B] uppercase">
            Kronos Gest
          </h2>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Selecione o Plano Ideal</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-2xl bg-white/10" />
              ))
            : plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    'cursor-pointer transition-all hover:scale-[1.02] border-2 bg-white text-slate-900',
                    selectedPlan?.id === plan.id
                      ? 'border-[#B8860B] shadow-[0_0_20px_rgba(184,134,11,0.4)] ring-2 ring-[#B8860B]'
                      : 'border-transparent shadow-lg',
                  )}
                  onClick={() => {
                    setSelectedPlan(plan)
                    setTimeout(
                      () => section2Ref.current?.scrollIntoView({ behavior: 'smooth' }),
                      100,
                    )
                  }}
                >
                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl font-bold font-display text-[#B8860B]">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-[#1E3A8A]">R$ {plan.price}</span>
                      <span className="text-slate-500 font-medium">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8">
                    <ul className="space-y-3">
                      {plan.benefits.map((b, j) => (
                        <li key={j} className="flex items-start text-slate-600">
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span className="text-sm font-medium">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="px-8 pb-8">
                    <Button
                      className={cn(
                        'w-full font-bold h-12 text-md',
                        selectedPlan?.id === plan.id
                          ? 'bg-[#B8860B] hover:bg-[#DAA520] text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPlan(plan)
                        setTimeout(
                          () => section2Ref.current?.scrollIntoView({ behavior: 'smooth' }),
                          100,
                        )
                      }}
                    >
                      {selectedPlan?.id === plan.id ? 'Plano Selecionado' : 'Escolher'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
        </div>

        {selectedPlan && (
          <div
            ref={section2Ref}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 animate-in slide-in-from-bottom-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-xl rounded-2xl overflow-hidden text-slate-900 bg-white">
                <CardHeader className="bg-slate-50 flex flex-row items-center justify-between border-b">
                  <div>
                    <CardTitle className="text-xl text-[#B8860B] font-display">
                      Método de Pagamento
                    </CardTitle>
                    <CardDescription>Escolha uma opção de pagamento segura</CardDescription>
                  </div>
                  <div className="flex items-center text-green-700 bg-green-100 px-3 py-1.5 rounded-full text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Seguro
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div
                    className={cn(
                      'flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-colors',
                      paymentMethod === 'cartao'
                        ? 'border-[#B8860B] bg-slate-50 ring-2 ring-[#B8860B]/20'
                        : 'border-slate-100 hover:border-slate-200',
                    )}
                    onClick={() => setPaymentMethod('cartao')}
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          paymentMethod === 'cartao' ? 'border-[#B8860B]' : 'border-slate-300',
                        )}
                      >
                        {paymentMethod === 'cartao' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Cartões / Carteiras Digitais</div>
                        <div className="text-xs text-slate-500 font-medium">
                          Aprovação imediata. Múltiplas bandeiras.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <img
                        src="https://img.usecurling.com/i?q=visa&shape=fill&color=multicolor"
                        alt="Visa"
                        className="h-5"
                      />
                      <img
                        src="https://img.usecurling.com/i?q=mastercard&shape=fill&color=multicolor"
                        alt="Mastercard"
                        className="h-5"
                      />
                      <img
                        src="https://img.usecurling.com/i?q=apple-pay&shape=fill&color=black"
                        alt="Apple"
                        className="h-5"
                      />
                      <img
                        src="https://img.usecurling.com/i?q=google-pay&shape=fill&color=multicolor"
                        alt="Google"
                        className="h-5"
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-colors',
                      paymentMethod === 'boleto'
                        ? 'border-[#B8860B] bg-slate-50 ring-2 ring-[#B8860B]/20'
                        : 'border-slate-100 hover:border-slate-200',
                    )}
                    onClick={() => setPaymentMethod('boleto')}
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          paymentMethod === 'boleto' ? 'border-[#B8860B]' : 'border-slate-300',
                        )}
                      >
                        {paymentMethod === 'boleto' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Boleto Bancário</div>
                        <div className="text-xs text-slate-500 font-medium max-w-sm">
                          Acesso liberado em até 3 dias úteis após confirmação bancária.
                        </div>
                      </div>
                    </div>
                    <Barcode className="h-8 w-8 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-[#1E3A8A] to-[#B8860B] border-none text-white shadow-xl h-fit rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              <div className="relative z-10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-display">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b border-white/20 pb-4">
                    <span className="text-lg">Plano {selectedPlan.name}</span>
                    <span className="font-bold text-xl">R$ {selectedPlan.price.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-300 font-bold border-b border-white/20 pb-4 items-center">
                      <span>Desconto aplicado</span>
                      <span>- R$ {(selectedPlan.price - calculateTotal()).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-3xl font-bold pt-2">
                    <span>Total</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/20">
                    <button
                      onClick={() => setShowCoupon(!showCoupon)}
                      className="text-white/80 hover:text-white text-sm flex items-center transition-colors"
                    >
                      <Tag className="h-4 w-4 mr-2" /> Possui um cupom de desconto?{' '}
                      {showCoupon ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                    {showCoupon && (
                      <div className="flex gap-2 mt-3 animate-in slide-in-from-top-2">
                        <Input
                          className="h-10 text-slate-900 bg-white/90 border-0"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Insira o código"
                        />
                        <Button
                          variant="secondary"
                          className="h-10 font-bold px-6 bg-white text-[#1E3A8A] hover:bg-slate-100"
                          onClick={applyCoupon}
                        >
                          Aplicar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6">
                  <Button
                    className="w-full bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:opacity-90 text-white font-bold h-14 text-lg shadow-lg border-0"
                    disabled={isProcessing}
                    onClick={() => handleCheckout()}
                  >
                    {isProcessing ? 'Processando...' : 'Finalizar Pagamento'}
                  </Button>
                </CardFooter>
              </div>
            </Card>
          </div>
        )}

        <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#1E3A8A] font-display">
                Dados para Nota Fiscal
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Preencha os dados abaixo para darmos continuidade ao pagamento de forma segura.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((d) => {
                  setShowGuestModal(false)
                  handleCheckout(d)
                })}
                className="space-y-4 pt-2"
              >
                {['nome_completo', 'cpf_cnpj', 'telefone', 'email', 'confirm_email'].map((f) => (
                  <FormField
                    key={f}
                    control={form.control}
                    name={f as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            className="bg-slate-50 border-slate-200 focus-visible:ring-[#1E3A8A]"
                            placeholder={f.replace('_', ' ').toUpperCase()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <DialogFooter className="pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-[#B8860B] hover:bg-[#DAA520] text-white font-bold h-12 text-md"
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
