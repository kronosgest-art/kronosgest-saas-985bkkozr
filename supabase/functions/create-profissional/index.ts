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
    const {
      nome_completo,
      email,
      telefone,
      especialidade,
      numero_registro,
      password,
      status,
      organization_id,
      tipo_profissional,
    } = reqData

    if (!email || !password || !nome_completo) {
      return new Response(JSON.stringify({ error: 'Faltam campos obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: nome_completo,
        role: 'profissional',
      },
    })

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create professional record
    const { data: profData, error: profError } = await supabase
      .from('profissionais')
      .insert({
        user_id: authData.user.id,
        nome_completo,
        email,
        telefone,
        especialidade,
        numero_registro,
        status: status !== false,
        organization_id,
        tipo_profissional: tipo_profissional || 'profissional_cadastrado',
        pode_ver_financeiro_clinica: false,
      })
      .select()
      .single()

    if (profError) {
      // Rollback auth user if professional creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return new Response(JSON.stringify({ error: profError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data: profData }), {
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
