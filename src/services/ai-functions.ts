import { supabase } from '@/lib/supabase/client'

export const analyzeBioresonance = async (pdfBase64: string, patientId: string) => {
  const { data, error } = await supabase.functions.invoke('analyze-bioresonance', {
    body: { pdf_base64: pdfBase64, patient_id: patientId },
  })
  return { data, error }
}

export const analyzeExames = async (pdfBase64: string, patientId: string, tipoExame: string) => {
  const { data, error } = await supabase.functions.invoke('analyze-exames', {
    body: { pdf_base64: pdfBase64, patient_id: patientId, tipo_exame: tipoExame },
  })
  return { data, error }
}

export const generatePrescription = async (
  patientId: string,
  anamneseId?: string,
  examesIds?: string[],
) => {
  const { data, error } = await supabase.functions.invoke('generate-prescription', {
    body: { patient_id: patientId, anamnese_id: anamneseId, exames_ids: examesIds },
  })
  return { data, error }
}
