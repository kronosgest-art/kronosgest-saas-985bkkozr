import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

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

    if (
      authHeader &&
      authHeader !== 'Bearer null' &&
      authHeader !== 'Bearer undefined' &&
      authHeader.length > 20
    ) {
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      })
      const {
        data: { user },
        error: userError,
      } = await supabaseUserClient.auth.getUser()

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
    } else if (guest_dados && guest_dados.email) {
      const { data: userExists } = await supabaseAdmin.rpc('check_user_exists_by_email', {
        p_email: guest_dados.email,
      })
      if (userExists) {
        return new Response(JSON.stringify({ error: 'Conta já existe. Faça login.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      userId = null
    } else {
      return new Response(
        JSON.stringify({ error: 'Autorização ou dados de visitante não fornecidos.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (!plano || !metodo_pagamento) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes.' }), {
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

      if (
        cupom.uso_atual !== null &&
        cupom.uso_maximo !== null &&
        cupom.uso_atual >= cupom.uso_maximo
      ) {
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

    const timestamp = Date.now()
    const order_nsu = `kronos-${userId || 'guest'}-${timestamp}`

    const infiniteTag = Deno.env.get('INFINITEPAY_HANDLE') || 'kronosgest'
    const infinitepayApiKey = Deno.env.get('INFINITEPAY_API_KEY') || 'mock_key_for_test'
    const priceInCents = Math.round(precoFinal * 100)

    let checkout_url = ''
    let attempt = 0
    const delays = [2000, 4000, 8000]
    let apiSuccess = false

    while (!apiSuccess) {
      try {
        const response = await fetch('https://api.checkout.infinitepay.io/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${infinitepayApiKey}`,
          },
          body: JSON.stringify({
            handle: infiniteTag,
            items: [
              {
                quantity: 1,
                price: priceInCents,
                description: `Assinatura Plano ${plano}`,
              },
            ],
            order_nsu: order_nsu,
            redirect_url: `https://kronosgest.com.br/checkout-sucesso?order_nsu=${order_nsu}`,
            webhook_url: `https://kronosgest.com.br/api/webhook-infinitypay`,
          }),
        })

        if (response.status === 503 && attempt < delays.length) {
          console.log(`Infinitypay retornou 503. Tentando em ${delays[attempt]}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delays[attempt]))
          attempt++
          continue
        }

        if (!response.ok) {
          const errText = await response.text()
          console.error(`Erro da API Infinitypay (${response.status}):`, errText)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            return new Response(
              JSON.stringify({ error: 'Erro ao gerar o link com a Infinitypay.' }),
              {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              },
            )
          }
          if (attempt < delays.length) {
            await new Promise((resolve) => setTimeout(resolve, delays[attempt]))
            attempt++
            continue
          }
          throw new Error('Falha contínua de comunicação com a Infinitypay.')
        }

        const apiResponseData = await response.json()
        checkout_url =
          apiResponseData.checkout_url ||
          apiResponseData.url ||
          `https://kronosgest.com.br/mock-checkout?order_nsu=${order_nsu}`
        apiSuccess = true
      } catch (err) {
        if (attempt < delays.length) {
          await new Promise((resolve) => setTimeout(resolve, delays[attempt]))
          attempt++
          continue
        }
        console.error(
          'Falha de conexão com Infinitypay, gerando link mockado para demonstração.',
          err,
        )
        checkout_url = `https://kronosgest.com.br/mock-checkout?order_nsu=${order_nsu}`
        apiSuccess = true
      }
    }

    const { error: pagamentoError } = await supabaseAdmin.from('pagamentos').insert({
      user_id: userId || null,
      guest_email: guest_dados?.email || null,
      guest_dados: guest_dados || null,
      plano,
      valor: precoFinal,
      order_nsu,
      status: 'pendente',
      metodo_pagamento,
      cupom_aplicado: cupom_codigo || null,
    })

    if (pagamentoError) {
      console.error('Erro ao salvar pagamento no banco:', pagamentoError)
    }

    return new Response(JSON.stringify({ checkout_url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Erro inesperado na edge function:', error)
    return new Response(
      JSON.stringify({ error: 'Ocorreu um erro interno ao processar a solicitação.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
