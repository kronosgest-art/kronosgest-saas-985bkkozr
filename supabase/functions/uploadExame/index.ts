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
    const { patient_id, tipo_exame, arquivo_pdf, organization_id } = reqData

    if (!patient_id || !tipo_exame || !arquivo_pdf) {
      return new Response(JSON.stringify({ error: 'Faltam parâmetros obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Process base64
    const base64Data = arquivo_pdf.includes(',') ? arquivo_pdf.split(',')[1] : arquivo_pdf
    const pdfBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

    const dataUpload = new Date().getTime()
    const fileName = `${dataUpload}_exame.pdf`
    const orgId = organization_id || 'default'
    const filePath = `${orgId}/${patient_id}/${tipo_exame}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('exames')
      .upload(filePath, pdfBytes, { contentType: 'application/pdf' })

    if (uploadError) {
      throw new Error(`Erro no upload do arquivo: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage.from('exames').getPublicUrl(filePath)
    const arquivo_pdf_url = publicUrlData.publicUrl

    const { data: exame, error: dbError } = await supabase
      .from('exames')
      .insert({
        patient_id,
        organization_id: organization_id || null,
        tipo: tipo_exame,
        arquivo_pdf_url,
        status: 'pendente',
      })
      .select('id')
      .single()

    if (dbError) {
      throw new Error(`Erro ao salvar no banco: ${dbError.message}`)
    }

    return new Response(
      JSON.stringify({
        exame_id: exame.id,
        url: arquivo_pdf_url,
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
