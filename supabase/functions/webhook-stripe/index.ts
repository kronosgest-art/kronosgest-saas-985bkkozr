import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { stripe_session_id, status, amount, customer_email } = body

    if (!stripe_session_id || !status || amount === undefined || !customer_email) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios ausentes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Valida se o session_id existe nos pagamentos com status pendente
    const { data: pagamento, error: pagError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('order_nsu', stripe_session_id)
      .single()

    if (pagError || !pagamento) {
      console.error('Sessão não encontrada:', stripe_session_id)
      return new Response(
        JSON.stringify({ error: 'Sessão não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (status === 'pago') {
      // 1. Atualiza pagamento para pago
      const { error: updatePagError } = await supabase
        .from('pagamentos')
        .update({ status: 'pago', data_pagamento: new Date().toISOString() })
        .eq('id', pagamento.id)

      if (updatePagError) throw updatePagError

      // 2. Define limites de tokens conforme plano
      const plano = pagamento.plano || 'Starter'
      let tokens_whatsapp_limite = 100
      let tokens_prescricoes_limite = 100

      if (plano.toLowerCase().includes('professional')) {
        tokens_whatsapp_limite = 500
        tokens_prescricoes_limite = 500
      } else if (plano.toLowerCase().includes('enterprise')) {
        tokens_whatsapp_limite = 2000
        tokens_prescricoes_limite = 2000
      }

      // Cria registro em tokens_inclusos
      const now = new Date()
      const mesAno = now.toISOString().substring(0, 7) // formato YYYY-MM
      const resetEm = new Date()
      resetEm.setMonth(resetEm.getMonth() + 1)

      const { error: tokensError } = await supabase
        .from('tokens_inclusos')
        .upsert({
          user_id: pagamento.user_id,
          plano: plano,
          tokens_whatsapp_limite,
          tokens_prescricoes_limite,
          mes_ano: mesAno,
          reset_em: resetEm.toISOString(),
          tokens_whatsapp_usado: 0,
          tokens_prescricoes_usado: 0
        }, { onConflict: 'user_id,mes_ano' })

      if (tokensError) {
        console.error('Erro ao criar tokens:', tokensError)
      }

      // 3. Atualiza cupom se aplicado
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

      return new Response(
        JSON.stringify({ message: 'Pagamento processado com sucesso' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (status === 'cancelado') {
      const { error: updatePagError } = await supabase
        .from('pagamentos')
        .update({ status: 'cancelado' })
        .eq('id', pagamento.id)

      if (updatePagError) throw updatePagError

      return new Response(
        JSON.stringify({ message: 'Pagamento processado com sucesso' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (status === 'pendente') {
      return new Response(
        JSON.stringify({ message: 'Pagamento processado com sucesso' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Status não mapeado, ignorado' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Erro no webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao processar pagamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
