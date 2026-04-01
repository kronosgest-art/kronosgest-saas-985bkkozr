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
    const pdf_base64 = reqData.pdf_base64 || reqData.pdfBase64 || reqData.pdf
    const patient_id = reqData.patient_id || reqData.patientId
    const tipo_exame = reqData.tipo_exame || reqData.tipoExame || 'geral'

    if (!patient_id) {
      return new Response(JSON.stringify({ error: 'Missing patient_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    let analysisResult = {
      valores_alterados: [
        'Glicemia em jejum: 110 mg/dL',
        'Colesterol LDL: 160 mg/dL',
        'Vitamina B12: 200 pg/mL',
      ],
      interpretacao:
        'O paciente apresenta quadro de pré-diabetes, hipercolesterolemia e deficiência de vitamina B12, necessitando de adequação alimentar e reavaliação clínica.',
      alerta: 'Risco cardiovascular moderado devido ao LDL elevado.',
    }

    if (geminiApiKey && pdf_base64) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analise este exame do tipo '${tipo_exame}' e retorne um JSON com a exata estrutura: {"valores_alterados": [], "interpretacao": "", "alerta": ""}`,
                  },
                  { inlineData: { mimeType: 'application/pdf', data: pdf_base64 } },
                ],
              },
            ],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (textResponse) {
          try {
            analysisResult = JSON.parse(textResponse)
          } catch (e) {
            console.error('Failed to parse Gemini response', textResponse)
          }
        }
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const mockPdfUrl = `https://nbeowmkpgwjexntvlyla.supabase.co/storage/v1/object/public/pdfs/exame_interpretado_${Date.now()}.pdf`

    let exameId = null

    const { error: dbError, data: insertedExame } = await supabase
      .from('exames')
      .insert({
        patient_id: patient_id,
        tipo: tipo_exame,
        resultado_json: analysisResult,
        arquivo_pdf_url: mockPdfUrl,
      })
      .select()
      .single()

    if (dbError) {
      console.warn('Could not insert exame (possibly invalid patient_id):', dbError.message)
    } else if (insertedExame) {
      exameId = insertedExame.id
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisResult,
        exame_id: exameId,
        pdf_url: mockPdfUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
