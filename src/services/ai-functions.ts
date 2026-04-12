import { supabase } from '@/lib/supabase/client'

const SUPABASE_URL = 'https://nbeowmkpgwjexntvlyla.supabase.co'

async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout?: number } = {},
) {
  const { timeout = 60000 } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  })
  clearTimeout(id)
  return response
}

export const uploadExame = async (
  patientId: string,
  tipoExame: string,
  arquivoPdfBase64: string,
  organizationId?: string,
) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/uploadExame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        patient_id: patientId,
        tipo_exame: tipoExame,
        arquivo_pdf: arquivoPdfBase64,
        organization_id: organizationId,
      }),
      timeout: 60000,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro na requisição')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const transcreverExame = async (arquivoPdfUrl: string) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/transcreverExame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ arquivo_pdf_url: arquivoPdfUrl }),
      timeout: 90000,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro na transcrição')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const interpretarExame = async (exameId: string, tipoExame: string, textoExame: string) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/interpretarExame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        exame_id: exameId,
        tipo_exame: tipoExame,
        texto_exame: textoExame,
      }),
      timeout: 90000,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro na requisição')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const analyzeBioresonance = async (pdfBase64: string, patientId: string) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/analyze-bioresonance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ pdf_base64: pdfBase64, patient_id: patientId }),
      timeout: 60000,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro na requisição')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const analyzeExames = async (pdfBase64: string, patientId: string, tipoExame: string) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/analyze-exames`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ pdf_base64: pdfBase64, patient_id: patientId, tipo_exame: tipoExame }),
      timeout: 60000,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro na requisição')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const gerarSugestaoPrescricao = async (
  patientId: string,
  anamneseId?: string,
  examesIds?: string[],
) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetchWithTimeout(
      `${SUPABASE_URL}/functions/v1/gerarSugestaoPrescricao`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patient_id: patientId,
          anamnese_id: anamneseId,
          exames_ids: examesIds,
        }),
        timeout: 60000,
      },
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro na requisição')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const generatePrescription = async (
  patientId: string,
  anamneseId?: string,
  examesIds?: string[],
) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/generate-prescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        patient_id: patientId,
        anamnese_id: anamneseId,
        exames_ids: examesIds,
      }),
      timeout: 60000,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro na requisição')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}
