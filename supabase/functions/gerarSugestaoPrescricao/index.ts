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
    const patient_id = reqData.patient_id || reqData.patientId
    const anamnese_id = reqData.anamnese_id || reqData.anamneseId
    const exames_ids = reqData.exames_ids || reqData.examesIds || []

    if (!patient_id) {
      return new Response(
        JSON.stringify({ error: 'Faltam parâmetros obrigatórios (patient_id)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    let promptContext = `Gerar sugestão de prescrição médica baseada em evidências, seguindo as diretrizes da SBPC/ML e SPC para o paciente.\n\n`

    // Buscar histórico do paciente
    const { data: patientData } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', patient_id)
      .single()

    if (patientData) {
      const age = patientData.data_nascimento
        ? new Date().getFullYear() - new Date(patientData.data_nascimento).getFullYear()
        : 'N/A'
      promptContext += `Dados do Paciente:\nNome: ${patientData.nome_completo}\nIdade: ${age}\nSexo: ${patientData.sexo || 'N/A'}\nHistórico/Observações: ${patientData.observacoes || 'N/A'}\n\n`
    }

    // Buscar anamnese
    if (anamnese_id) {
      const { data: anamneseData } = await supabase
        .from('anamnese')
        .select('respostas')
        .eq('anamnese_id', anamnese_id)
        .single()

      if (anamneseData) {
        promptContext += `Respostas da Anamnese:\n${JSON.stringify(anamneseData.respostas)}\n\n`
      }
    }

    // Buscar interpretação dos exames
    if (exames_ids && exames_ids.length > 0) {
      const { data: examesData } = await supabase
        .from('exames')
        .select('tipo, resultado_json, interpretacao_ia')
        .in('id', exames_ids)

      if (examesData && examesData.length > 0) {
        promptContext += `Dados e Interpretações de Exames Recentes:\n${JSON.stringify(examesData)}\n\n`
      }
    }

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada no servidor.')
    }

    const prompt = `Você é um médico especialista. A partir dos dados clínicos abaixo, gere uma sugestão de prescrição médica baseada nas diretrizes da SBPC/ML (Sociedade Brasileira de Patologia Clínica/Medicina Laboratorial) e SPC (Sociedade Paulista de Cardiologia ou diretrizes cardiológicas pertinentes).
    
    Retorne APENAS o texto da prescrição de forma clara, pronta para ir para um receituário, incluindo compostos, fórmulas, dosagens, frequência e orientações ao paciente.
    Não use marcações markdown como \`\`\` nos extremos, apenas o texto puro formatado para leitura.\n\n${promptContext}`

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

    if (!aiResponse.ok) {
      const err = await aiResponse.text()
      throw new Error(`Erro na API da OpenAI: ${err}`)
    }

    const data = await aiResponse.json()
    const sugestaoText =
      data.choices?.[0]?.message?.content ||
      'Não foi possível gerar a sugestão de prescrição no momento.'

    return new Response(
      JSON.stringify({
        success: true,
        sugestao: sugestaoText,
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
