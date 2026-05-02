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
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const reqData = await req.json()
    const { plano, metodo_pagamento, cupom_codigo, guest_dados, origin } = reqData

    const baseUrl = origin || 'https://kronosgest.com.br'
    let userId = reqData.user_id || null
    let customerEmail = guest_dados?.email || ''

    if (!plano || !metodo_pagamento) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ['card']
    if (metodo_pagamento === 'boleto') paymentMethodTypes = ['boleto']

    const planosPrecos: Record<string, number> = { Starter: 49, Professional: 199, Enterprise: 499 }
    let precoOriginal = 0

    if (plano.startsWith('Tokens-')) {
      const qtdTokens = parseInt(plano.split('-')[1])
      if (!isNaN(qtdTokens) && qtdTokens >= 100) precoOriginal = (qtdTokens / 100) * 29
    } else {
      precoOriginal = planosPrecos[plano] || 0
    }

    let precoFinal = precoOriginal

    if (cupom_codigo && precoFinal > 0) {
      const { data: cupom } = await supabaseAdmin
        .from('cupons')
        .select('*')
        .eq('codigo', cupom_codigo.toUpperCase())
        .eq('status', 'ativo')
        .single()
      if (
        cupom &&
        new Date(cupom.data_fim) >= new Date() &&
        cupom.uso_maximo > (cupom.uso_atual || 0)
      ) {
        if (cupom.desconto_percentual) precoFinal *= 1 - cupom.desconto_percentual / 100
        else if (cupom.desconto_fixo) precoFinal = Math.max(0, precoFinal - cupom.desconto_fixo)
      }
    }

    const priceInCents = Math.round(precoFinal * 100)

    if (priceInCents === 0) {
      const dummySessionId = 'cs_free_' + crypto.randomUUID().replace(/-/g, '')
      await supabaseAdmin.from('pagamentos').insert({
        user_id: userId,
        guest_email: customerEmail,
        guest_dados,
        plano,
        valor: 0,
        order_nsu: dummySessionId,
        status: 'pendente',
        metodo_pagamento,
        cupom_aplicado: cupom_codigo || null,
      })

      const webhookUrl = `${supabaseUrl}/functions/v1/webhook-stripe`
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripe_session_id: dummySessionId,
          status: 'pago',
          amount: 0,
          customer_email: customerEmail,
        }),
      }).catch((err) => console.error('Local webhook error:', err))

      return new Response(
        JSON.stringify({
          session_id: dummySessionId,
          checkout_url: `${baseUrl}/checkout-sucesso?order_nsu=${dummySessionId}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (priceInCents > 0 && priceInCents < 200) {
      return new Response(JSON.stringify({ error: 'Valor mínimo processado é R$ 2,00.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: `Assinatura Plano ${plano}` },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/checkout-sucesso?order_nsu={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      customer_email: customerEmail || undefined,
      metadata: {
        user_id: String(userId || ''),
        plano: String(plano || ''),
        cupom_aplicado: String(cupom_codigo || ''),
        nome_completo: String(guest_dados?.nome_completo || ''),
        cpf_cnpj: String(guest_dados?.cpf_cnpj || ''),
        telefone: String(guest_dados?.telefone || ''),
      },
    })

    await supabaseAdmin.from('pagamentos').insert({
      user_id: userId,
      guest_email: customerEmail,
      guest_dados,
      plano,
      valor: precoFinal,
      order_nsu: session.id,
      status: 'pendente',
      metodo_pagamento,
      cupom_aplicado: cupom_codigo || null,
    })

    return new Response(JSON.stringify({ session_id: session.id, checkout_url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Stripe API error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
