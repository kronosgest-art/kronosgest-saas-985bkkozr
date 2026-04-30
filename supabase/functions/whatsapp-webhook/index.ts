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
    const numero_whatsapp = reqData.numero_whatsapp
    const mensagem = reqData.mensagem
    const tipo = reqData.tipo
    const timestamp = reqData.timestamp || new Date().toISOString()

    if (
      !numero_whatsapp ||
      typeof numero_whatsapp !== 'string' ||
      !mensagem ||
      typeof mensagem !== 'string' ||
      !tipo ||
      !['incoming', 'outgoing'].includes(tipo)
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Campos obrigatórios ausentes ou inválidos: numero_whatsapp (string), mensagem (string), tipo (incoming/outgoing)',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    const incomingApiKey = req.headers.get('apikey') || req.headers.get('x-api-key')
    if (evolutionApiKey && incomingApiKey && incomingApiKey !== evolutionApiKey) {
      return new Response(
        JSON.stringify({ error: 'Acesso não autorizado. Chave da Evolution API inválida.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Salvar na tabela mensagens_whatsapp
    const { data: dbData, error: dbError } = await supabase
      .from('mensagens_whatsapp')
      .insert({
        numero_whatsapp,
        mensagem,
        tipo,
        processada: false,
        resposta_ia: null,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Erro ao salvar mensagem no Supabase:', dbError)
      throw new Error('Falha ao registrar mensagem no banco de dados.')
    }

    let resposta_ia = null

    if (tipo === 'incoming') {
      const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openAiApiKey) {
        throw new Error('OPENAI_API_KEY não configurada no servidor.')
      }

      const prompt = `Voce e um assistente de saude integrativa especializado em ozonioterapia, biorressonancia e saude intestinal. Responda a pergunta do paciente de forma BREVE (maximo 2 paragrafos, ~150 caracteres). Mensagem: ${mensagem}`

      let attempt = 0
      const delays = [2000, 4000, 8000]
      let aiResponseSuccess = false

      while (!aiResponseSuccess) {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        })

        if (aiResponse.status === 503 && attempt < delays.length) {
          console.log(`OpenAI retornou 503. Tentando novamente em ${delays[attempt]}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delays[attempt]))
          attempt++
          continue
        }

        if (!aiResponse.ok) {
          const err = await aiResponse.text()
          throw new Error(`Erro na API da OpenAI: ${err}`)
        }

        const data = await aiResponse.json()
        resposta_ia = data.choices?.[0]?.message?.content || ''
        aiResponseSuccess = true
      }

      // Atualizar a mensagem com a resposta processada
      await supabase
        .from('mensagens_whatsapp')
        .update({
          processada: true,
          resposta_ia,
        })
        .eq('id', dbData.id)
    }

    return new Response(
      JSON.stringify({
        data: {
          numero_whatsapp,
          mensagem,
          resposta_ia,
          timestamp,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Erro na execução do webhook:', error)
    return new Response(
      JSON.stringify({
        error: `Ocorreu um erro interno ao processar a mensagem: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
