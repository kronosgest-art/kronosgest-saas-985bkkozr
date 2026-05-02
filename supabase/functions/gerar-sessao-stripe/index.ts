import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14.20.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    const reqData = await req.json()
    const { plano, metodo_pagamento, cupom_codigo, guest_dados } = reqData
    
    let userId = reqData.user_id || null
    let customerEmail = ''

    if (authHeader && authHeader !== 'Bearer null' && authHeader !== 'Bearer undefined' && authHeader.length > 20) {
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser()

      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Usuário não autenticado.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      if (userId && userId !== user.id) {
        return new Response(JSON.stringify({ error: 'Usuário inválido para a requisição.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      userId = user.id
      customerEmail = user.email || ''
    } else if (guest_dados && guest_dados.email) {
      const { data: userExists } = await supabaseAdmin.rpc('check_user_exists_by_email', { p_email: guest_dados.email })
      if (userExists) {
        return new Response(JSON.stringify({ error: 'Conta já existe. Faça login.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      userId = null
      customerEmail = guest_dados.email
    } else {
      return new Response(JSON.stringify({ error: 'Autorização ou dados de visitante não fornecidos.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!plano || !metodo_pagamento) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (metodo_pagamento !== 'cartao_internacional' && metodo_pagamento !== 'stripe') {
       return new Response(JSON.stringify({ error: 'Método de pagamento inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const planosPrecos: Record<string, number> = {
      Starter: 49,
      Professional: 199,
      Enterprise: 499,
    }

    let precoOriginal = 0

    if (plano.startsWith('Tokens-')) {
      const qtdTokens = parseInt(plano.split('-')[1])
      if (isNaN(qtdTokens) || qtdTokens < 100 || qtdTokens > 10000 || qtdTokens % 100 !== 0) {
        return new Response(JSON.stringify({ error: 'Quantidade de tokens inválida.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      precoOriginal = (qtdTokens / 100) * 29
    } else if (planosPrecos[plano]) {
      precoOriginal = planosPrecos[plano]
    } else {
      return new Response(JSON.stringify({ error: 'Plano selecionado é inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    let precoFinal = precoOriginal
    let desconto = 0

    if (cupom_codigo) {
      const { data: cupom, error: cupomError } = await supabaseAdmin
        .from('cupons')
        .select('*')
        .eq('codigo', cupom_codigo.toUpperCase())
        .eq('status', 'ativo')
        .single()

      if (cupomError || !cupom) {
        return new Response(JSON.stringify({ error: 'Cupom inválido ou inativo.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (new Date(cupom.data_fim) < new Date()) {
        return new Response(JSON.stringify({ error: 'O cupom informado está expirado.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (cupom.uso_atual !== null && cupom.uso_maximo !== null && cupom.uso_atual >= cupom.uso_maximo) {
        return new Response(JSON.stringify({ error: 'Limite de uso do cupom atingido.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (cupom.desconto_percentual) {
        desconto = precoOriginal * (cupom.desconto_percentual / 100)
      } else if (cupom.desconto_fixo) {
        desconto = cupom.desconto_fixo
      }

      precoFinal = Math.max(0, precoOriginal - desconto)
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada no servidor.')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const priceInCents = Math.round(precoFinal * 100)
    let session: Stripe.Checkout.Session | null = null
    let attempt = 0
    const delays = [2000, 4000, 8000]

    while (!session) {
      try {
        session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'brl',
                product_data: {
                  name: `Assinatura Plano ${plano}`,
                },
                unit_amount: priceInCents,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `https://kronosgest.com.br/checkout-sucesso?order_nsu={CHECKOUT_SESSION_ID}`,
          cancel_url: `https://kronosgest.com.br/checkout`,
          customer_email: customerEmail,
          metadata: {
            user_id: userId || '',
            plano,
            cupom_aplicado: cupom_codigo || '',
          },
        })
      } catch (err: any) {
        if (err.statusCode === 503 && attempt < delays.length) {
          console.log(`Stripe retornou 503. Tentando em ${delays[attempt]}ms...`)
          await new Promise((r) => setTimeout(r, delays[attempt]))
          attempt++
          continue
        }
        console.error('Stripe API error:', err)
        return new Response(
          JSON.stringify({ error: 'Erro ao comunicar com o processador de pagamentos Stripe.' }),
          {
            status: err.statusCode >= 400 && err.statusCode < 500 ? err.statusCode : 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    const { error: pagamentoError } = await supabaseAdmin
      .from('pagamentos')
      .insert({
        user_id: userId || null,
        guest_email: guest_dados?.email || null,
        guest_dados: guest_dados || null,
        plano,
        valor: precoFinal,
        order_nsu: session.id,
        status: 'pendente',
        metodo_pagamento: 'cartao_internacional',
        cupom_aplicado: cupom_codigo || null,
      })

    if (pagamentoError) {
      console.error('Erro ao salvar pagamento no banco:', pagamentoError)
    }

    return new Response(
      JSON.stringify({ session_id: session.id, checkout_url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Erro inesperado na edge function:', error)
    return new Response(
      JSON.stringify({ error: 'Ocorreu um erro interno ao processar a solicitação.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
