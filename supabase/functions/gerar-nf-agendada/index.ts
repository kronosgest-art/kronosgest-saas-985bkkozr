import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const limitDate = new Date()
    limitDate.setDate(limitDate.getDate() - 8)

    const { data: nfs, error } = await supabase
      .from('dados_nf')
      .select('*')
      .eq('status', 'pendente_nf')
      .lte('data_pagamento', limitDate.toISOString())

    if (error) {
      throw error
    }

    let processed = 0
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    for (const nf of nfs || []) {
      const numero_nf = `NF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

      await supabase
        .from('dados_nf')
        .update({
          status: 'nf_gerada',
          data_geracao_nf: new Date().toISOString(),
          numero_nf,
        })
        .eq('id', nf.id)

      processed++

      if (resendApiKey && nf.email) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Kronos Gest <no-reply@kronosgest.com.br>',
              to: [nf.email],
              subject: `Sua Nota Fiscal ${numero_nf} - Kronos Gest`,
              html: `<p>Olá, ${nf.nome_completo}.</p><p>Sua nota fiscal número <strong>${numero_nf}</strong> referente ao plano ${nf.plano} no valor de R$ ${nf.valor_pagamento} foi gerada com sucesso.</p><p>Agradecemos a preferência!</p>`,
            }),
          })
        } catch (e) {
          console.error(`Erro ao enviar email de NF para ${nf.email}:`, e)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed, message: `${processed} notas fiscais geradas.` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error('Erro na geração de NF:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
