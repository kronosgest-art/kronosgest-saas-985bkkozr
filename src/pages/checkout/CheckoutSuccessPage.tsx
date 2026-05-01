import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Pagamento {
  id: string
  plano: string
  valor: number
  status: string
  data_pagamento: string | null
}

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderNsu = searchParams.get('order_nsu')

  const [loading, setLoading] = useState(true)
  const [pagamento, setPagamento] = useState<Pagamento | null>(null)

  useEffect(() => {
    async function checkPayment() {
      if (!orderNsu) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('order_nsu', orderNsu)
          .single()

        if (!error && data) {
          setPagamento(data as Pagamento)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkPayment()
  }, [orderNsu])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A8A] to-blue-900 flex items-center justify-center p-4">
      {loading ? (
        <Card className="w-full max-w-md border-0 shadow-2xl animate-in fade-in duration-300">
          <CardHeader className="text-center pb-2">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-12 w-full rounded-md" />
          </CardFooter>
        </Card>
      ) : pagamento?.status === 'pago' ? (
        <Card className="w-full max-w-md border-0 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="text-center pb-2">
            <CheckCircle2 className="w-16 h-16 text-[#B8860B] mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-[#B8860B]">
              Pagamento Confirmado!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">
              Sua assinatura foi ativada com sucesso. Bem-vindo ao Kronos Gest!
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Plano</span>
                <span className="font-medium text-gray-900">{pagamento.plano}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Valor</span>
                <span className="font-medium text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    pagamento.valor,
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Data</span>
                <span className="font-medium text-gray-900">
                  {pagamento.data_pagamento
                    ? format(new Date(pagamento.data_pagamento), "dd 'de' MMM, yyyy", {
                        locale: ptBR,
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#B8860B] hover:opacity-90 text-white border-0 h-12 text-lg transition-all"
              onClick={() => navigate('/')}
            >
              Ir para Dashboard
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-md border-0 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="text-center pb-2">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-800">
              Pagamento não confirmado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-2">
              Não foi possível confirmar o seu pagamento ou ele ainda está pendente.
            </p>
            {orderNsu && <p className="text-center text-xs text-gray-400">NSU: {orderNsu}</p>}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full h-12 text-lg border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
              onClick={() => navigate('/checkout')}
            >
              Voltar para Checkout
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
