import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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
    const body = await req.json()
    const { stripe_session_id, status, amount, customer_email } = body

    if (!stripe_session_id || !status || amount === undefined || !customer_email) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: pagamento, error: pagError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('order_nsu', stripe_session_id)
      .single()

    if (pagError || !pagamento) {
      console.error('Sessão não encontrada:', stripe_session_id)
      return new Response(JSON.stringify({ error: 'Sessão não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (status === 'pago') {
      const { error: updatePagError } = await supabase
        .from('pagamentos')
        .update({ status: 'pago', data_pagamento: new Date().toISOString() })
        .eq('id', pagamento.id)

      if (updatePagError) throw updatePagError

      let finalUserId = pagamento.user_id

      if (!finalUserId && pagamento.guest_dados && pagamento.guest_email) {
        const guestData = pagamento.guest_dados as any
        const cpfCnpjNumbers = guestData.cpf_cnpj
          ? String(guestData.cpf_cnpj).replace(/\D/g, '')
          : ''
        const tempPassword =
          cpfCnpjNumbers.length >= 6
            ? cpfCnpjNumbers
            : Array.from(crypto.getRandomValues(new Uint8Array(8)))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('')
                .substring(0, 16)

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: pagamento.guest_email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            name: guestData.nome_completo,
            role: 'profissional',
          },
        })

        if (!authError && authUser?.user) {
          finalUserId = authUser.user.id

          await supabase.from('pagamentos').update({ user_id: finalUserId }).eq('id', pagamento.id)

          await supabase.from('profissionais').insert({
            user_id: finalUserId,
            nome_completo: guestData.nome_completo,
            email: guestData.email,
            telefone: guestData.telefone,
            cpf: guestData.cpf_cnpj,
            tipo_profissional: 'proprietario',
            status: true,
          })

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
                to: [guestData.email],
                subject: 'Bem-vindo ao Kronos Gest!',
                html: `<p>Sua conta foi criada com sucesso.</p><p>Email: ${guestData.email}</p><p>Senha inicial: <strong>${tempPassword}</strong> (Seu CPF/CNPJ, apenas números)</p><p>Acesse: <a href="https://kronosgest.com.br/login">https://kronosgest.com.br/login</a></p><p>Sua Nota Fiscal será emitida automaticamente pelo nosso sistema em breve.</p>`,
              }),
            })
          } else {
            console.log(
              'RESEND_API_KEY não configurada. Email não enviado. Senha temporária:',
              tempPassword,
            )
          }
        } else {
          console.error('Erro ao criar usuário guest:', authError)
        }
      }

      if (finalUserId) {
        const plano = pagamento.plano || 'Starter'
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

      if (pagamento.cupom_aplicado) {
        const { data: cupom } = await supabase
          .from('cupons')
          .select('id, uso_atual')
          .eq('codigo', pagamento.cupom_aplicado)
          .single()

        if (cupom) {
          await supabase
            .from('cupons')
            .update({ uso_atual: (cupom.uso_atual || 0) + 1 })
            .eq('id', cupom.id)
        }
      }

      return new Response(JSON.stringify({ message: 'Pagamento processado com sucesso' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (status === 'cancelado') {
      await supabase.from('pagamentos').update({ status: 'cancelado' }).eq('id', pagamento.id)

      return new Response(JSON.stringify({ message: 'Pagamento processado com sucesso' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (status === 'pendente') {
      return new Response(JSON.stringify({ message: 'Pagamento processado com sucesso' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ message: 'Status não mapeado, ignorado' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Erro no webhook:', error)
    return new Response(JSON.stringify({ error: 'Erro ao processar pagamento' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
