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
    const { exame_id, tipo_exame, arquivo_pdf_url } = reqData

    if (!exame_id || !arquivo_pdf_url) {
      return new Response(JSON.stringify({ error: 'Faltam parâmetros obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada no servidor.')
    }

    const pdfResponse = await fetch(arquivo_pdf_url)
    if (!pdfResponse.ok) {
      throw new Error('Não foi possível baixar o PDF do Storage.')
    }
    const pdfBlob = await pdfResponse.blob()
    const pdfArrayBuffer = await pdfBlob.arrayBuffer()
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)))

    const prompt =
      tipo_exame === 'biorressonancia'
        ? 'Você é especialista em biorressonância. Liste as principais manifestações energéticas alteradas (usando linguagem de probabilidade) e recomende acompanhamento.'
        : 'Você é especialista em exames laboratoriais. Liste os principais valores fora da referência, explicando o significado clínico e recomendando acompanhamento médico.'

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
              ],
            },
          ],
        }),
      },
    )

    if (!aiResponse.ok) {
      const err = await aiResponse.text()
      throw new Error(`Erro na API do Gemini: ${err}`)
    }

    const data = await aiResponse.json()
    const interpretacao_ia =
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'Interpretação não retornou dados.'

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    await supabase
      .from('exames')
      .update({
        interpretacao_ia,
        status: 'interpretado',
      })
      .eq('id', exame_id)

    return new Response(JSON.stringify({ sucesso: true, interpretacao: interpretacao_ia }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ sucesso: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
