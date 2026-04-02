import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, BrainCircuit, AlertCircle } from 'lucide-react'

export default function Step6Interpretation({ data }: { data?: any }) {
  const [exames, setExames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!data?.patient_id) {
      setLoading(false)
      return
    }

    // Fetch exams that have AI interpretation
    supabase
      .from('exames')
      .select('*')
      .eq('patient_id', data.patient_id)
      .not('interpretacao_ia', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data: examesData }) => {
        setExames(examesData || [])
        setLoading(false)
      })
  }, [data?.patient_id])

  if (!data?.patient_id) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>Cadastre o paciente no Passo 1 primeiro.</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatInterpretation = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.includes('ENCAMINHAR AO MÉDICO')) {
        return (
          <span
            key={i}
            className="bg-yellow-200 text-yellow-900 font-semibold px-2 py-1 rounded block my-2"
          >
            {line}
          </span>
        )
      }
      if (line.toLowerCase().includes('acompanhamento')) {
        return (
          <span
            key={i}
            className="bg-green-200 text-green-900 font-semibold px-2 py-1 rounded block my-2"
          >
            {line}
          </span>
        )
      }
      return (
        <span key={i} className="block my-1">
          {line}
        </span>
      )
    })
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Interpretação Geral (IA)</h2>
        <p className="text-muted-foreground">
          Visão consolidada de todas as análises clínicas geradas na consulta atual.
        </p>
      </div>

      {exames.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl">
          <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum exame analisado</p>
          <p className="text-sm mt-1">Você não fez upload de exames nos passos anteriores.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {exames.map((exame) => (
            <Card key={exame.id} className="border-primary/20 shadow-sm overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                <h3 className="font-semibold flex items-center gap-2 capitalize text-primary text-lg">
                  <BrainCircuit className="h-5 w-5" />
                  Exame {exame.tipo}
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="text-sm space-y-2 bg-white rounded-lg">
                  {formatInterpretation(exame.interpretacao_ia)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
