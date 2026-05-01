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

    if (
      !invoice_slug ||
      !order_nsu ||
      !status ||
      amount === undefined ||
      !capture_method
    ) {
      return new Response(
        JSON.stringify({
          error: 'Campos obrigatórios ausentes: invoice_slug, order_nsu, status, amount, capture_method',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
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
          user_id: pagamento.user_id,
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

      return new Response(JSON.stringify({ message: 'Pagamento processado com sucesso' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // pendente ou outros status
      return new Response(JSON.stringify({ message: 'Pagamento processado com sucesso' }), {
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
