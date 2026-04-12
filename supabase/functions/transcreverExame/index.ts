import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

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
    const bytes = new Uint8Array(pdfArrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64Pdf = btoa(binary)

    const prompt =
      'Extraia e transcreva todo o texto deste documento PDF, preservando a estrutura dos dados do exame laboratorial de forma fiel.'

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
    const texto_extraido = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

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
