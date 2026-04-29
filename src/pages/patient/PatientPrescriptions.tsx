import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, FileSignature } from 'lucide-react'

export default function PatientPrescriptions() {
  const { user } = useAuth()
  const [prescricoes, setPrescricoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return

      const { data: patient } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (patient) {
        const { data } = await supabase
          .from('prescricoes')
          .select('*')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
        if (data) setPrescricoes(data)
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Minhas Prescrições</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prescricoes.map((p) => (
          <Card key={p.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prescrição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Data: {new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <Button
                variant="outline"
                className="w-full mt-2"
                size="sm"
                onClick={() => {
                  if (p.arquivo_pdf_url) window.open(p.arquivo_pdf_url, '_blank')
                }}
                disabled={!p.arquivo_pdf_url}
              >
                <FileSignature className="mr-2 h-4 w-4" />
                Ver Prescrição Completa
              </Button>
            </CardContent>
          </Card>
        ))}
        {prescricoes.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhuma prescrição encontrada.
          </div>
        )}
      </div>
    </div>
  )
}
