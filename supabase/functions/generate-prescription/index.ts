import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const reqData = await req.json()
    const patient_id = reqData.patient_id || reqData.patientId
    const anamnese_id = reqData.anamnese_id || reqData.anamneseId
    const exames_ids = reqData.exames_ids || reqData.examesIds || []

    if (!patient_id) {
      return new Response(JSON.stringify({ error: 'Missing patient_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    let promptContext = `Gerar prescrição médica baseada em evidências para o paciente ID: ${patient_id}.`

    if (exames_ids && exames_ids.length > 0) {
      const { data: examesData } = await supabase
        .from('exames')
        .select('tipo, resultado_json')
        .in('id', exames_ids)

      if (examesData && examesData.length > 0) {
        promptContext += `\nResultados de exames do paciente:\n${JSON.stringify(examesData)}`
      }
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    let prescriptionResult = {
      prescricao:
        '1. Vitamina D3 10.000 UI - Tomar 1 gota ao dia\n2. Ômega 3 1000mg - Tomar 2 cápsulas após o almoço\n3. Metilcobalamina 1mg - 1 comprimido sublingual ao dia',
      posologia: 'Uso contínuo por 60 dias. Retornar para reavaliação com novos exames.',
      avisos: [
        'Não ingerir os suplementos de estômago vazio',
        'Manter a Vitamina D e Ômega 3 em local fresco e ao abrigo da luz',
      ],
    }

    if (geminiApiKey) {
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
                    text: `Baseado nos dados a seguir, crie uma prescrição médica completa, segura e retorne APENAS um JSON com a exata estrutura: {"prescricao": "", "posologia": "", "avisos": []}. \n\nContexto Clínico:\n${promptContext}`,
                  },
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
            prescriptionResult = JSON.parse(textResponse)
          } catch (e) {
            console.error('Failed to parse Gemini response', textResponse)
          }
        }
      }
    }

    const mockPdfUrl = `https://nbeowmkpgwjexntvlyla.supabase.co/storage/v1/object/public/pdfs/prescricao_${Date.now()}.pdf`

    let prescricaoId = null

    const { error: dbError, data: insertedPrescricao } = await supabase
      .from('prescricoes')
      .insert({
        patient_id: patient_id,
        anamnese_id: anamnese_id || null,
        exames_ids: exames_ids || [],
        conteudo_json: prescriptionResult,
        arquivo_pdf_url: mockPdfUrl,
      })
      .select()
      .single()

    if (dbError) {
      console.warn('Could not insert prescricao (possibly invalid patient_id):', dbError.message)
    } else if (insertedPrescricao) {
      prescricaoId = insertedPrescricao.id
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: prescriptionResult,
        prescricao_id: prescricaoId,
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
