import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { Buffer } from 'node:buffer'
import pdfParse from 'npm:pdf-parse@1.1.1'

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
    const { arquivo_pdf_url } = reqData

    if (!arquivo_pdf_url) {
      return new Response(
        JSON.stringify({ error: 'Faltam parâmetros obrigatórios (arquivo_pdf_url)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada no servidor.')
    }

    const pdfResponse = await fetch(arquivo_pdf_url)
    if (!pdfResponse.ok) {
      throw new Error('Não foi possível baixar o PDF do Storage.')
    }

    // Extraindo texto do PDF utilizando pdf-parse, pois a API de Chat Completions do GPT-4
    // não suporta o envio direto de arquivos base64 (diferente do Gemini).
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBuffer = Buffer.from(pdfArrayBuffer)
    const pdfData = await pdfParse(pdfBuffer)
    const rawText = pdfData.text || ''

    const prompt = `Extraia e transcreva todo o texto a seguir (proveniente de um exame laboratorial em PDF), preservando a estrutura dos dados de forma fiel. Corrija eventuais erros de espaçamento da extração original.\n\nTexto original:\n${rawText}`

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    if (!aiResponse.ok) {
      const err = await aiResponse.text()
      throw new Error(`Erro na API da OpenAI: ${err}`)
    }

    const data = await aiResponse.json()
    const texto_extraido = data.choices?.[0]?.message?.content || ''

    return new Response(JSON.stringify({ sucesso: true, texto_extraido }), {
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
