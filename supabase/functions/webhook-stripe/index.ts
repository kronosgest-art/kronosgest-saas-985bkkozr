import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, stripe-signature',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Valida JWT se presente
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)
      if (error || !user) {
        return new Response(JSON.stringify({ error: 'JWT inválido' }), {
          status: 401,
          headers: corsHeaders,
        })
      }
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    let bodyData: any
    let event: Stripe.Event | null = null
    const rawBody = await req.text()

    if (stripeSecretKey && stripeWebhookSecret && req.headers.get('stripe-signature')) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-06-20',
        httpClient: Stripe.createFetchHttpClient(),
      })
      const signature = req.headers.get('stripe-signature')!
      try {
        event = await stripe.webhooks.constructEventAsync(rawBody, signature, stripeWebhookSecret)
        bodyData = event
      } catch (err: any) {
        console.error('Stripe signature error:', err.message)
        return new Response(JSON.stringify({ error: 'Assinatura Stripe inválida' }), {
          status: 400,
          headers: corsHeaders,
        })
      }
    } else {
      try {
        bodyData = JSON.parse(rawBody)
      } catch (e) {
        return new Response(JSON.stringify({ error: 'JSON inválido' }), {
          status: 400,
          headers: corsHeaders,
        })
      }
    }

    let stripe_session_id = ''
    let status = ''
    let metadata: any = {}
    let guest_email = ''

    // 1. Webhook recebe evento do Stripe (charge.succeeded ou payment_intent.succeeded)
    if (bodyData.type && bodyData.data && bodyData.data.object) {
      event = bodyData
      const obj = event.data.object as any

      if (event.type === 'checkout.session.completed') {
        stripe_session_id = obj.id
        status = obj.payment_status === 'paid' ? 'pago' : 'pendente'
        metadata = obj.metadata || {}
        guest_email = obj.customer_details?.email || obj.customer_email || ''
      } else if (event.type === 'payment_intent.succeeded' || event.type === 'charge.succeeded') {
        status = 'pago'
        metadata = obj.metadata || {}
        stripe_session_id = metadata.order_nsu || obj.id
        guest_email = obj.receipt_email || obj.billing_details?.email || ''
      } else {
        return new Response(JSON.stringify({ message: 'Evento ignorado' }), {
          status: 200,
          headers: corsHeaders,
        })
      }
    } else {
      // Fallback local
      stripe_session_id = bodyData.stripe_session_id || bodyData.order_nsu
      status = bodyData.status || 'pendente'
      metadata = bodyData.metadata || {}
      guest_email = bodyData.customer_email || bodyData.guest_email || ''
    }

    // 2. Valida se status = "pago"
    if (status !== 'pago') {
      return new Response(JSON.stringify({ message: 'Pagamento não concluído, ignorado' }), {
        status: 200,
        headers: corsHeaders,
      })
    }

    const { data: pagamento, error: pagError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('order_nsu', stripe_session_id)
      .single()

    if (pagError || !pagamento) {
      console.error('Pagamento não encontrado para nsu:', stripe_session_id)
      return new Response(JSON.stringify({ error: 'Pagamento não encontrado' }), {
        status: 404,
        headers: corsHeaders,
      })
    }

    // 3. Extrai dados dos metadados e sanitiza
    const plano = metadata.plano || pagamento.plano || 'Starter'
    const rawGuestDados =
      typeof pagamento.guest_dados === 'string'
        ? JSON.parse(pagamento.guest_dados)
        : pagamento.guest_dados || {}

    const finalEmail = String(
      guest_email || metadata.email || pagamento.guest_email || rawGuestDados.email || '',
    )
      .trim()
      .toLowerCase()
    const finalNome = String(
      metadata.nome_completo || rawGuestDados.nome_completo || 'Usuário',
    ).trim()
    const finalCpf = String(metadata.cpf_cnpj || rawGuestDados.cpf_cnpj || '').replace(/\D/g, '')
    const finalTelefone = String(metadata.telefone || rawGuestDados.telefone || '').replace(
      /\D/g,
      '',
    )

    if (!finalEmail) {
      return new Response(JSON.stringify({ error: 'Email ausente nos dados do cliente' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    let finalUserId = pagamento.user_id

    if (!finalUserId) {
      // 4. Cria usuário no Supabase (auth.users)
      const randomPassword = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: finalEmail,
        password: randomPassword, // bcrypt é padrão no Supabase Auth
        email_confirm: true,
        user_metadata: {
          name: finalNome,
          role: 'profissional',
        },
      })

      if (authError) {
        if (authError.message.includes('already exists') || authError.status === 422) {
          // Se email já existe, obtém o user_id existente e prossegue
          const { data: userRpc } = await supabase.rpc('get_user_id_by_email', {
            p_email: finalEmail,
          })
          if (userRpc) {
            finalUserId = userRpc
          } else {
            console.error('Não foi possível recuperar ID do usuário existente')
            return new Response(JSON.stringify({ error: 'Erro ao recuperar usuário existente' }), {
              status: 500,
              headers: corsHeaders,
            })
          }
        } else {
          console.error('Erro ao criar usuário:', authError)
          return new Response(
            JSON.stringify({ error: 'Erro ao criar usuário: ' + authError.message }),
            { status: 500, headers: corsHeaders },
          )
        }
      } else if (authData?.user) {
        // 5. Obtém user_id do usuário criado
        finalUserId = authData.user.id

        const encryptionKey = Deno.env.get('STRIPE_SECRET_KEY') || 'default-kronos-key'

        // 8. Cria registro em usuarios (tabela de perfil) - CPF criptografado via RPC
        await supabase.rpc('insert_usuario_encrypted', {
          p_user_id: finalUserId,
          p_nome: finalNome,
          p_cpf: finalCpf,
          p_telefone: finalTelefone,
          p_email: finalEmail,
          p_criado_via: 'guest_checkout',
          p_secret_key: encryptionKey,
        })

        // Opcional: mantendo em profissionais para retrocompatibilidade
        await supabase.from('profissionais').insert({
          user_id: finalUserId,
          nome_completo: finalNome,
          email: finalEmail,
          telefone: finalTelefone,
          cpf: finalCpf,
          tipo_profissional: 'proprietario',
          status: true,
        })

        // 9. Envia email com login/senha
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        if (resendApiKey) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Kronos Gest <no-reply@kronosgest.com.br>',
              to: [finalEmail],
              subject: 'Seu acesso ao Kronos Gest foi liberado!',
              html: `<h2>Bem-vindo(a) ao Kronos Gest!</h2>
                     <p>Olá <strong>${finalNome}</strong>, seu pagamento foi confirmado.</p>
                     <p>Seu acesso foi gerado com sucesso. Utilize as credenciais abaixo para acessar:</p>
                     <p><strong>Link de acesso:</strong> <a href="https://kronosgest.com.br/login">https://kronosgest.com.br/login</a></p>
                     <p><strong>Email:</strong> ${finalEmail}</p>
                     <p><strong>Senha:</strong> ${randomPassword}</p>
                     <br/>
                     <p>Recomendamos que você altere sua senha no primeiro acesso.</p>`,
            }),
          })
        }
      }
    }

    if (finalUserId) {
      // 6. Atualiza registro em pagamentos
      await supabase
        .from('pagamentos')
        .update({
          user_id: finalUserId,
          status: 'pago',
          data_pagamento: new Date().toISOString(),
        })
        .eq('id', pagamento.id)

      // 7. Cria registro em tokens_inclusos
      if (plano.startsWith('Tokens-')) {
        const qtdTokens = parseInt(plano.split('-')[1]) || 0
        const expiraEm = new Date()
        expiraEm.setDate(expiraEm.getDate() + 30)
        await supabase.from('tokens_comprados').insert({
          user_id: finalUserId,
          quantidade: qtdTokens,
          preco_pago: pagamento.valor,
          tokens_restantes: qtdTokens,
          expira_em: expiraEm.toISOString(),
          status: 'ativo',
          metodo_pagamento: pagamento.metodo_pagamento,
        })
      } else {
        let tokens_whatsapp_limite = 100
        let tokens_prescricoes_limite = 100

        if (plano.toLowerCase().includes('professional')) {
          tokens_whatsapp_limite = 500
          tokens_prescricoes_limite = 500
        } else if (plano.toLowerCase().includes('enterprise')) {
          tokens_whatsapp_limite = 2000
          tokens_prescricoes_limite = 2000
        }

        const now = new Date()
        const mesAno = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
        const resetEm = new Date()
        resetEm.setMonth(resetEm.getMonth() + 1)

        await supabase.from('tokens_inclusos').upsert(
          {
            user_id: finalUserId,
            plano: plano,
            tokens_whatsapp_limite,
            tokens_prescricoes_limite,
            mes_ano: mesAno,
            reset_em: resetEm.toISOString(),
            tokens_whatsapp_usado: 0,
            tokens_prescricoes_usado: 0,
          },
          { onConflict: 'user_id,mes_ano' },
        )
      }
    }

    // 10. Retorna 200 OK
    return new Response(
      JSON.stringify({ message: 'Pagamento processado e conta provisionada com sucesso' }),
      { status: 200, headers: corsHeaders },
    )
  } catch (error: any) {
    console.error('Erro geral no webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar webhook: ' + error.message }),
      { status: 500, headers: corsHeaders },
    )
  }
})
