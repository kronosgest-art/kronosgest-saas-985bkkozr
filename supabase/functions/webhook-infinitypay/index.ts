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
    const reqData = await req.json()
    const { invoice_slug, order_nsu, status, amount, capture_method } = reqData

    if (!invoice_slug || !order_nsu || !status || amount === undefined || !capture_method) {
      return new Response(
        JSON.stringify({
          error:
            'Campos obrigatórios ausentes: invoice_slug, order_nsu, status, amount, capture_method',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: pagamento, error: pagError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('order_nsu', order_nsu)
      .single()

    if (pagError || !pagamento) {
      return new Response(JSON.stringify({ error: 'Pedido não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const normalizedStatus = status.toLowerCase()

    if (
      normalizedStatus === 'pago' ||
      normalizedStatus === 'paid' ||
      normalizedStatus === 'approved'
    ) {
      const { error: updateError } = await supabase
        .from('pagamentos')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString(),
          invoice_slug: invoice_slug,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', pagamento.id)

      if (updateError) {
        throw new Error(`Erro ao atualizar pagamento: ${updateError.message}`)
      }

      let finalUserId = pagamento.user_id

      if (!finalUserId && pagamento.guest_dados && pagamento.guest_email) {
        const guestData = pagamento.guest_dados as any
        const tempPassword = Array.from(crypto.getRandomValues(new Uint8Array(8)))
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

          const dbSecret = Deno.env.get('DB_ENCRYPTION_KEY') || 'kronos_secret_2026'
          await supabase.rpc('inserir_dados_nf', {
            p_user_id: finalUserId,
            p_nome_completo: guestData.nome_completo,
            p_cpf_cnpj: guestData.cpf_cnpj,
            p_telefone: guestData.telefone || '',
            p_email: guestData.email,
            p_plano: pagamento.plano,
            p_valor_pagamento: pagamento.valor,
            p_data_pagamento: new Date().toISOString(),
            p_encryption_key: dbSecret,
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
                html: `<p>Sua conta foi criada com sucesso.</p><p>Email: ${guestData.email}</p><p>Senha temporária: <strong>${tempPassword}</strong></p><p>Acesse: <a href="https://kronosgest.com.br/login">https://kronosgest.com.br/login</a></p><p>Sua Nota Fiscal será gerada em 8 dias e enviada para seu email.</p>`,
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
        if (pagamento.plano.startsWith('Tokens-')) {
          const qtdTokens = parseInt(pagamento.plano.split('-')[1]) || 0
          const expiraEm = new Date()
          expiraEm.setDate(expiraEm.getDate() + 30)

          const { error: tokenError } = await supabase.from('tokens_comprados').insert({
            user_id: finalUserId,
            quantidade: qtdTokens,
            preco_pago: pagamento.valor,
            tokens_restantes: qtdTokens,
            expira_em: expiraEm.toISOString(),
            status: 'ativo',
            metodo_pagamento: pagamento.metodo_pagamento,
          })

          if (tokenError) {
            console.error('Erro ao adicionar tokens avulsos:', tokenError)
          }
        } else {
          let wppLimite = 0
          let prescLimite = 0
          const planoNormalizado = pagamento.plano.toLowerCase()

          if (planoNormalizado === 'starter') {
            wppLimite = 30
            prescLimite = 5
          } else if (planoNormalizado === 'professional') {
            wppLimite = 300
            prescLimite = 50
          } else if (planoNormalizado === 'enterprise') {
            wppLimite = 1000
            prescLimite = 200
          }

          const resetEm = new Date()
          resetEm.setMonth(resetEm.getMonth() + 1)
          const mesAno = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`

          const { error: tokenError } = await supabase.from('tokens_inclusos').upsert(
            {
              user_id: finalUserId,
              plano: pagamento.plano,
              tokens_whatsapp_limite: wppLimite,
              tokens_prescricoes_limite: prescLimite,
              tokens_whatsapp_usado: 0,
              tokens_prescricoes_usado: 0,
              mes_ano: mesAno,
              reset_em: resetEm.toISOString(),
            },
            { onConflict: 'user_id, mes_ano' },
          )

          if (tokenError) {
            console.error('Erro ao criar tokens:', tokenError)
          }
        }
      }

      if (pagamento.cupom_aplicado) {
        const { data: cupom } = await supabase
          .from('cupons')
          .select('uso_atual')
          .eq('codigo', pagamento.cupom_aplicado)
          .single()

        if (cupom) {
          await supabase
            .from('cupons')
            .update({ uso_atual: (cupom.uso_atual || 0) + 1 })
            .eq('codigo', pagamento.cupom_aplicado)
        }
      }

      return new Response(JSON.stringify({ message: 'Pagamento processado com sucesso' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else if (
      normalizedStatus === 'cancelado' ||
      normalizedStatus === 'canceled' ||
      normalizedStatus === 'failed' ||
      normalizedStatus === 'recusado' ||
      normalizedStatus === 'refunded'
    ) {
      const { error: updateError } = await supabase
        .from('pagamentos')
        .update({
          status: 'cancelado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pagamento.id)

      if (updateError) {
        throw new Error(`Erro ao atualizar pagamento: ${updateError.message}`)
      }

      return new Response(JSON.stringify({ message: 'Pagamento cancelado processado' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      return new Response(JSON.stringify({ message: 'Status ignorado' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    return new Response(JSON.stringify({ error: 'Erro ao processar pagamento' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
