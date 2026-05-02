import { useState, useEffect } from 'react'
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
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  CreditCard,
  QrCode,
  FileText,
  AlertCircle,
  Coins,
  Loader2,
  CalendarClock,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function TokensAvulsos() {
  const { user } = useAuth()
  const [quantidade, setQuantidade] = useState<number | ''>(100)
  const [metodoPagamento, setMetodoPagamento] = useState<string>('pix')
  const [aba, setAba] = useState<string>('brasil')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      setQuantidade('')
      return
    }
    const num = parseInt(val)
    if (!isNaN(num)) {
      setQuantidade(num)
    }
  }

  const handleAbaChange = (value: string) => {
    setAba(value)
    if (value === 'brasil') {
      setMetodoPagamento('pix')
    } else {
      setMetodoPagamento('cartao_internacional')
    }
  }

  const precoTotal = typeof quantidade === 'number' ? (quantidade / 100) * 29 : 0
  const isInvalid =
    typeof quantidade !== 'number' ||
    quantidade < 100 ||
    quantidade > 10000 ||
    quantidade % 100 !== 0
  const isEmpty = quantidade === '' || quantidade === 0

  const handleComprar = async () => {
    if (isInvalid) {
      setError('A quantidade deve ser um múltiplo de 100, entre 100 e 10.000.')
      return
    }
    if (!metodoPagamento) {
      setError('Selecione um método de pagamento.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const endpoint = 'gerar-sessao-stripe'
      const planoNome = `Tokens-${quantidade}`

      const { data, error: funcError } = await supabase.functions.invoke(endpoint, {
        body: {
          user_id: user?.id,
          plano: planoNome,
          metodo_pagamento: metodoPagamento,
        },
      })

      if (funcError) throw new Error(funcError.message)
      if (data?.error) throw new Error(data.error)

      if (data?.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        throw new Error('URL de checkout não retornada.')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao processar pagamento. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#1E3A8A] to-blue-900 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#1E3A8A] to-blue-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#B8860B]">Compre Tokens Avulsos</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Aumente seu limite instantaneamente. Cada token = 1 resposta WhatsApp ou 1 prescrição.
            R$ 29 = 100 tokens. Válido por 30 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Info Card */}
            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur">
              <CardContent className="p-6 flex items-center justify-around text-center divide-x divide-gray-200">
                <div className="px-4">
                  <Coins className="w-8 h-8 text-[#B8860B] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Preço Base</p>
                  <p className="font-bold text-gray-800 text-lg">R$ 29 / 100 un</p>
                </div>
                <div className="px-4">
                  <FileText className="w-8 h-8 text-[#B8860B] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Utilização</p>
                  <p className="font-bold text-gray-800 text-lg">WhatsApp / IA</p>
                </div>
                <div className="px-4">
                  <CalendarClock className="w-8 h-8 text-[#B8860B] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Validade</p>
                  <p className="font-bold text-gray-800 text-lg">30 Dias</p>
                </div>
              </CardContent>
            </Card>

            {/* Quantity Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#B8860B]">Seleção de Quantidade</CardTitle>
                <CardDescription>Quantos tokens deseja comprar?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative w-full max-w-[250px]">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="number"
                      min={100}
                      max={10000}
                      step={100}
                      value={quantidade}
                      onChange={handleQuantidadeChange}
                      className="pl-10 text-lg font-bold h-12 border-gray-300 focus-visible:ring-[#B8860B]"
                      placeholder="Ex: 500"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Mínimo: 100 tokens (R$ 29)</p>
                    <p>Máximo: 10.000 tokens (R$ 2.900)</p>
                    <p>Incremento: 100 tokens</p>
                  </div>
                </div>
                {isEmpty && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Selecione uma quantidade para começar.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#B8860B]">Método de Pagamento</CardTitle>
                <CardDescription>Escolha a opção de pagamento desejada</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={aba} onValueChange={handleAbaChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger
                      value="brasil"
                      className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-white"
                    >
                      Brasil
                    </TabsTrigger>
                    <TabsTrigger
                      value="internacional"
                      className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-white"
                    >
                      Internacional
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="brasil" className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div
                        onClick={() => setMetodoPagamento('pix')}
                        className={cn(
                          'cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all',
                          metodoPagamento === 'pix'
                            ? 'border-[#B8860B] bg-amber-50/50'
                            : 'border-gray-100 hover:border-gray-300',
                        )}
                      >
                        <QrCode
                          className={cn(
                            'w-8 h-8',
                            metodoPagamento === 'pix' ? 'text-[#B8860B]' : 'text-gray-400',
                          )}
                        />
                        <span
                          className={cn(
                            'font-medium',
                            metodoPagamento === 'pix' ? 'text-[#B8860B]' : 'text-gray-600',
                          )}
                        >
                          Pix
                        </span>
                      </div>

                      <div
                        onClick={() => setMetodoPagamento('boleto')}
                        className={cn(
                          'cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all',
                          metodoPagamento === 'boleto'
                            ? 'border-[#B8860B] bg-amber-50/50'
                            : 'border-gray-100 hover:border-gray-300',
                        )}
                      >
                        <FileText
                          className={cn(
                            'w-8 h-8',
                            metodoPagamento === 'boleto' ? 'text-[#B8860B]' : 'text-gray-400',
                          )}
                        />
                        <span
                          className={cn(
                            'font-medium',
                            metodoPagamento === 'boleto' ? 'text-[#B8860B]' : 'text-gray-600',
                          )}
                        >
                          Boleto
                        </span>
                      </div>

                      <div
                        onClick={() => setMetodoPagamento('cartao_credito')}
                        className={cn(
                          'cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all',
                          metodoPagamento === 'cartao_credito'
                            ? 'border-[#B8860B] bg-amber-50/50'
                            : 'border-gray-100 hover:border-gray-300',
                        )}
                      >
                        <CreditCard
                          className={cn(
                            'w-8 h-8',
                            metodoPagamento === 'cartao_credito'
                              ? 'text-[#B8860B]'
                              : 'text-gray-400',
                          )}
                        />
                        <span
                          className={cn(
                            'font-medium',
                            metodoPagamento === 'cartao_credito'
                              ? 'text-[#B8860B]'
                              : 'text-gray-600',
                          )}
                        >
                          Cartão de Crédito
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="internacional"
                    className="space-y-4 animate-in fade-in duration-300"
                  >
                    <div
                      onClick={() => setMetodoPagamento('cartao_internacional')}
                      className={cn(
                        'cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all w-full sm:w-1/3',
                        metodoPagamento === 'cartao_internacional'
                          ? 'border-[#B8860B] bg-amber-50/50'
                          : 'border-gray-100 hover:border-gray-300',
                      )}
                    >
                      <CreditCard
                        className={cn(
                          'w-8 h-8',
                          metodoPagamento === 'cartao_internacional'
                            ? 'text-[#B8860B]'
                            : 'text-gray-400',
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          metodoPagamento === 'cartao_internacional'
                            ? 'text-[#B8860B]'
                            : 'text-gray-600',
                        )}
                      >
                        Cartão Internacional
                      </span>
                      <span className="text-xs text-gray-400">(Stripe)</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <div className="md:col-span-1">
            <Card className="border-0 shadow-xl sticky top-24">
              <CardHeader className="bg-gray-50 rounded-t-xl border-b border-gray-100">
                <CardTitle className="text-gray-800">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {isEmpty ? (
                  <div className="text-center py-8 text-gray-400">
                    <Coins className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Adicione tokens para ver o resumo</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Quantidade:</span>
                      <span className="font-bold text-gray-900">{quantidade} Tokens</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600 pb-4 border-b border-gray-100">
                      <span>Validade:</span>
                      <span className="font-medium text-gray-900">30 dias</span>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-gray-500 mb-1">Total a pagar</p>
                      <p className="text-4xl font-black text-[#B8860B]">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(precoTotal)}
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <p>{error}</p>
                          <button
                            onClick={handleComprar}
                            className="underline text-red-800 font-medium mt-1"
                          >
                            Tentar novamente
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  className={cn(
                    'w-full h-14 text-lg font-bold transition-all',
                    !isInvalid && metodoPagamento && !isEmpty
                      ? 'bg-gradient-to-r from-[#B8860B] to-yellow-600 hover:opacity-90 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                  )}
                  onClick={handleComprar}
                  disabled={isInvalid || !metodoPagamento || loading || isEmpty}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Prosseguir para Pagamento'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
