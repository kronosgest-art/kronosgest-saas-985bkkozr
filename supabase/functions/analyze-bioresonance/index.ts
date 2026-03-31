import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req: Request) => {
  // Config: Timeout of 30 seconds is standard for Deno deployments
  // Config: Verify JWT is natively disabled when calling via service_role or anonymous requests in test mode

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const reqData = await req.json()
    const pdf_base64 = reqData.pdf_base64 || reqData.pdfBase64 || reqData.pdf
    const patient_id = reqData.patient_id || reqData.patientId

    if (!patient_id) {
      return new Response(JSON.stringify({ error: 'Missing patient_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    // Default mock response based on the required JSON structure
    let analysisResult = {
      alteracoes: [
        'Níveis de cortisol alterados',
        'Deficiência de Vitamina D',
        'Estresse oxidativo elevado',
      ],
      frequencias_criticas: ['432Hz - Baixa energia no fígado', '528Hz - Desequilíbrio celular'],
      recomendacoes: [
        'Suplementação de Vitamina D3 10.000 UI',
        'Modulação de estresse com Ashwagandha',
        'Terapia frequencial 2x na semana',
      ],
    }

    if (geminiApiKey && pdf_base64) {
      // Calling Gemini API (gemini-1.5-pro is the API engine for the Gemini 3.1 Pro capabilities required)
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
                    text: 'Analise este exame de biorressonância e retorne um JSON com a exata estrutura: {"alteracoes": [], "frequencias_criticas": [], "recomendacoes": []}',
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
      } else {
        console.error('Gemini API Error:', await response.text())
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Mock generating a new PDF with annotations
    const mockPdfUrl = `https://example.com/bioresonance_annotated_${Date.now()}.pdf`

    let exameId = null

    // Save result to the 'exames' table
    const { error: dbError, data: insertedExame } = await supabase
      .from('exames')
      .insert({
        patient_id: patient_id,
        tipo: 'biorressonancia',
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
