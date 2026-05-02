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

    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    let user = null;

    if (authHeader && authHeader !== 'Bearer null' && authHeader !== 'Bearer undefined' && authHeader.length > 20) {
      const token = authHeader.replace('Bearer ', '');
      if (token !== supabaseAnonKey) {
        const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        })
        const { data: userData } = await supabaseUserClient.auth.getUser()
        user = userData?.user || null;
      }
    }

    if (user) {
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

    const validMethods = ['pix', 'boleto', 'cartao', 'cartao_credito', 'cartao_internacional', 'stripe', 'credit_card']
    if (!validMethods.includes(metodo_pagamento)) {
       return new Response(JSON.stringify({ error: 'Método de pagamento inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ['card']
    if (metodo_pagamento === 'pix') {
      paymentMethodTypes = ['pix']
    } else if (metodo_pagamento === 'boleto') {
      paymentMethodTypes = ['boleto']
    } else if (metodo_pagamento === 'cartao' || metodo_pagamento === 'cartao_credito' || metodo_pagamento === 'cartao_internacional' || metodo_pagamento === 'credit_card') {
      paymentMethodTypes = ['card']
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

    if (priceInCents === 0) {
      const dummySessionId = 'cs_free_' + crypto.randomUUID().replace(/-/g, '');
      
      const { error: pagamentoError } = await supabaseAdmin
        .from('pagamentos')
        .insert({
          user_id: userId || null,
          guest_email: guest_dados?.email || null,
          guest_dados: guest_dados || null,
          plano,
          valor: 0,
          order_nsu: dummySessionId,
          status: 'pendente',
          metodo_pagamento,
          cupom_aplicado: cupom_codigo || null,
        });

      if (pagamentoError) {
        console.error('Erro ao salvar pagamento gratuito no banco:', pagamentoError);
      }

      // Simulate webhook call to provision the user and tokens immediately
      const webhookUrl = `${supabaseUrl}/functions/v1/webhook-stripe`;
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripe_session_id: dummySessionId,
          status: 'pago',
          amount: 0,
          customer_email: customerEmail
        })
      }).catch(err => console.error('Error invoking webhook locally:', err));

      return new Response(
        JSON.stringify({ session_id: dummySessionId, checkout_url: `https://kronosgest.com.br/checkout-sucesso?order_nsu=${dummySessionId}` }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (priceInCents > 0 && priceInCents < 200) {
      return new Response(JSON.stringify({ error: 'O valor final com desconto não pode ser menor que R$ 2,00. O Stripe não processa valores abaixo desse limite.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let session: Stripe.Checkout.Session | null = null
    let attempt = 0
    const delays = [2000, 4000, 8000]

    while (!session) {
      try {
        session = await stripe.checkout.sessions.create({
          payment_method_types: paymentMethodTypes,
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
          customer_email: customerEmail || undefined,
          metadata: {
            user_id: String(userId || '').substring(0, 500),
            plano: String(plano || '').substring(0, 500),
            cupom_aplicado: String(cupom_codigo || '').substring(0, 500),
            nome_completo: String(guest_dados?.nome_completo || '').substring(0, 500),
            cpf_cnpj: String(guest_dados?.cpf_cnpj || '').substring(0, 500),
            telefone: String(guest_dados?.telefone || '').substring(0, 500)
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
          JSON.stringify({ 
            error: 'Erro ao comunicar com o processador de pagamentos Stripe.',
            details: err.message 
          }),
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
        metodo_pagamento,
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
