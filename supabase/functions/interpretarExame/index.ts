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

    if (!exame_id || !tipo_exame || !arquivo_pdf_url) {
      return new Response(JSON.stringify({ error: 'Faltam parâmetros obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada no servidor.')
    }

    // Download PDF to base64
    const pdfResponse = await fetch(arquivo_pdf_url)
    if (!pdfResponse.ok) {
      throw new Error('Não foi possível baixar o PDF do Storage.')
    }
    const pdfBlob = await pdfResponse.blob()
    const pdfArrayBuffer = await pdfBlob.arrayBuffer()
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)))

    let prompt = ''
    if (tipo_exame === 'biorressonancia') {
      prompt = `Você é um especialista em biorressonância. Analise este exame de biorressonância e forneça uma interpretação estruturada.
   
   IMPORTANTE: Biorressonância é um exame complementar que mostra manifestações energéticas. Siga estas regras:
   
   1. SEMPRE comece com: 'Este exame de biorressonância mostra as seguintes manifestações energéticas:'
   
   2. Para cada item alterado, use SEMPRE a linguagem de PROBABILIDADE:
      - Nunca diga 'O paciente tem cistos nos ovários'
      - SEMPRE diga 'Existe probabilidade de manifestação de cistos nos ovários'
      - Nunca diga 'O paciente tem inflamação na próstata'
      - SEMPRE diga 'Existe probabilidade de manifestação de inflamação na próstata'
   
   3. VALIDAÇÃO COM ANAMNESE: Se o paciente NÃO relatou na anamnese que já conhece o problema, adicione:
      'Como o paciente não relatou este problema na anamnese, recomenda-se encaminhamento ao médico para diagnóstico e possível tratamento.'
   
   4. Se o paciente JÁ relatou na anamnese que tem o problema, adicione:
      'O paciente já relatou este problema na anamnese. Recomenda-se acompanhamento médico contínuo.'
   
   5. ATENÇÃO PRIMÁRIA: Se algum item aparecer em 'atenção primária', sempre encaminhe ao médico.
   
   6. Forneça a interpretação em formato estruturado:
      - Item alterado
      - Probabilidade de manifestação
      - Recomendação (acompanhamento ou encaminhamento médico)
   
   Análise do exame: [ARQUIVO PDF]`
    } else {
      prompt = `Você é um especialista em análises clínicas. Analise este exame laboratorial e forneça uma interpretação estruturada.
   
   IMPORTANTE: Exames laboratoriais são regulamentados e mostram resultados exatos. Siga estas regras:
   
   1. SEMPRE comece com: 'Este exame laboratorial mostra os seguintes resultados:'
   
   2. Para cada item alterado, descreva EXATAMENTE o que significa:
      - Diga exatamente o que a alteração indica
      - Cite os valores de referência
      - Explique o significado clínico
   
   3. VALIDAÇÃO COM ANAMNESE: 
      - Se o paciente JÁ relatou na anamnese que tem o problema: 'O paciente já conhecia este resultado. Recomenda-se acompanhamento médico.'
      - Se o paciente NÃO relatou: 'Este resultado não foi relatado na anamnese. ENCAMINHAR AO MÉDICO para diagnóstico e prescrição de medicações.'
   
   4. ENCAMINHAMENTO MÉDICO: Para qualquer alteração não conhecida pelo paciente, sempre encaminhe ao médico.
   
   5. Forneça a interpretação em formato estruturado:
      - Parâmetro
      - Valor encontrado
      - Valor de referência
      - Significado clínico
      - Recomendação (acompanhamento ou encaminhamento médico)
   
   Análise do exame: [ARQUIVO PDF]`
    }

    let interpretacao_ia = 'Não foi possível interpretar o exame.'

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
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
          generationConfig: { responseMimeType: 'text/plain' },
        }),
      },
    )

    if (aiResponse.ok) {
      const data = await aiResponse.json()
      interpretacao_ia = data.candidates?.[0]?.content?.parts?.[0]?.text || interpretacao_ia
    } else {
      const err = await aiResponse.text()
      throw new Error(`Erro na API do Gemini: ${err}`)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: dbError } = await supabase
      .from('exames')
      .update({
        interpretacao_ia,
        status: 'interpretado',
      })
      .eq('id', exame_id)

    if (dbError) {
      throw new Error(`Erro ao atualizar o status do exame: ${dbError.message}`)
    }

    return new Response(JSON.stringify({ interpretacao_ia }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
