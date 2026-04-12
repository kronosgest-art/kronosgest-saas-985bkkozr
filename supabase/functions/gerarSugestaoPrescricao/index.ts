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

    const authHeader = req.headers.get('Authorization')
    let userId = null
    let profissionalContext = ''

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const {
        data: { user },
      } = await supabase.auth.getUser(token)
      if (user) {
        userId = user.id
        const { data: prof } = await supabase
          .from('profissionais')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (prof) {
          profissionalContext = `Profissional: ${prof.nome_completo}\nEspecialidade: ${prof.especialidade || 'Não informada'}\nRegistro: ${prof.tipo_registro} ${prof.numero_registro || prof.cpf || ''}\n\n`
        }
      }
    }

    let promptContext = `Gerar sugestão de prescrição suplementar baseada em evidências, seguindo as diretrizes da SBPC/ML e SPC para o paciente.\n\n`
    promptContext += profissionalContext

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

    const prompt = `Você é um especialista em medicina integrativa e ortomolecular, alinhado aos ensinamentos do Dr. Lair Ribeiro. A partir dos dados clínicos abaixo, gere uma sugestão de prescrição de suplementação para corrigir as carências nutricionais e otimizar a saúde do paciente.
    
    REGRAS CRÍTICAS DE PRESCRIÇÃO:
    1. NUNCA sugira medicamentos alopáticos ou prescritos (ex: antibióticos, anti-hipertensivos, etc).
    2. O foco deve ser EXCLUSIVAMENTE em SUPLEMENTAÇÃO (vitaminas, minerais, nutracêuticos, fitoterápicos) e orientações de estilo de vida.
    3. CONSOLIDAÇÃO DE ATIVOS: Agrupe os ativos em uma ÚNICA FÓRMULA com 2 ou mais itens sempre que possível e clinicamente compatível.
    4. FORMA FARMACÊUTICA: Avalie e sugira a via de administração mais interessante e adequada para o paciente (ex: cápsula, sachê, comprimido sublingual, xarope, goma de mascar, comprimido mastigável).
    5. INTERAÇÕES E CONFLITOS: Analise rigorosamente as interações farmacológicas e competições de absorção. Se houver interação entre ativos, SEPARE-OS obrigatoriamente em fórmulas diferentes com HORÁRIOS DE TOMADA DIFERENTES.
    6. Retorne APENAS o texto da prescrição de forma clara, pronta para ir para um receituário, incluindo compostos, fórmulas, dosagens, frequência e orientações ao paciente.
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
