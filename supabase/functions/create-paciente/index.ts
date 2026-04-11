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
    const nome_completo = reqData.nome_completo || reqData.name
    const cpf = reqData.cpf
    const email = reqData.email
    const telefone = reqData.telefone || reqData.phone
    const user_id = reqData.user_id || reqData.userId
    const organization_id = reqData.organization_id || reqData.organizationId

    if (!nome_completo) {
      return new Response(JSON.stringify({ error: 'Missing nome_completo' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('pacientes')
      .insert({
        nome_completo,
        cpf: cpf || null,
        email: email || null,
        telefone: telefone || null,
        data_nascimento: reqData.dataNascimento || null,
        sexo: reqData.sexo || null,
        endereco: reqData.endereco || null,
        profissao: reqData.profissao || null,
        observacoes: reqData.obs || null,
        user_id: user_id || null,
        organization_id: organization_id || null,
        status: 'Ativo',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return new Response(JSON.stringify({ error: 'CPF ou Email já cadastrado.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      throw error
    }

    return new Response(JSON.stringify({ success: true, data }), {
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
