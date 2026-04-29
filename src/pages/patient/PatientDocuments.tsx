import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, FileText, CheckCircle, PenTool } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export default function PatientDocuments() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [anamneses, setAnamneses] = useState<any[]>([])
  const [tcles, setTcles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [docToSign, setDocToSign] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data: patient } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (patient) {
        const { data: anamnesesData } = await supabase
          .from('anamnese')
          .select('*, anamnese_templates(nome_template)')
          .eq('patient_id', patient.id)
          .order('criado_em', { ascending: false })

        if (anamnesesData) setAnamneses(anamnesesData)

        const { data: tcleData } = await supabase
          .from('tcle_assinado')
          .select('*')
          .eq('patient_id', patient.id)
          .order('data_assinatura', { ascending: false })

        if (tcleData) setTcles(tcleData)
      }
      setLoading(false)
    }
    load()
  }, [user])

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSign = async () => {
    if (!docToSign) return

    const canvas = canvasRef.current
    if (!canvas) return

    const signatureImage = canvas.toDataURL('image/png')

    const { error } = await supabase
      .from('anamnese')
      .update({
        assinatura_paciente: {
          data: new Date().toISOString(),
          imagem: signatureImage,
          ip: 'Digital',
        },
      })
      .eq('anamnese_id', docToSign.anamnese_id)

    if (!error) {
      setAnamneses(
        anamneses.map((a) =>
          a.anamnese_id === docToSign.anamnese_id
            ? {
                ...a,
                assinatura_paciente: { data: new Date().toISOString(), imagem: signatureImage },
              }
            : a,
        ),
      )
      toast({ title: 'Documento assinado com sucesso' })
      setDocToSign(null)
    } else {
      toast({ title: 'Erro ao assinar documento', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Meus Documentos</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" /> Anamneses e Fichas
          </h2>
          {anamneses.length === 0 ? (
            <p className="text-muted-foreground text-sm border border-dashed rounded-lg p-6 text-center">
              Nenhuma anamnese encontrada.
            </p>
          ) : (
            anamneses.map((a) => (
              <Card key={a.anamnese_id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {a.anamnese_templates?.nome_template || 'Anamnese'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Data: {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                  {a.assinatura_paciente ? (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" /> Assinado
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => setDocToSign(a)}>
                      <PenTool className="h-4 w-4 mr-2" /> Assinar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" /> Termos e Contratos
          </h2>
          {tcles.length === 0 ? (
            <p className="text-muted-foreground text-sm border border-dashed rounded-lg p-6 text-center">
              Nenhum termo assinado encontrado.
            </p>
          ) : (
            tcles.map((t) => (
              <Card key={t.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {t.tipo_assinatura || 'Termo de Consentimento'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Data: {new Date(t.data_assinatura).toLocaleDateString('pt-BR')}
                  </div>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" /> Assinado
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!docToSign} onOpenChange={(o) => !o && setDocToSign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assinar Documento</DialogTitle>
            <DialogDescription>
              Ao assinar, você concorda com as informações preenchidas em{' '}
              {docToSign?.anamnese_templates?.nome_template || 'sua ficha clínica'}.
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-md bg-secondary/20 p-2 flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-2 w-full text-left font-medium">
              Desenhe sua assinatura abaixo:
            </p>
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="border bg-white rounded-md cursor-crosshair touch-none max-w-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="w-full flex justify-end mt-2">
              <Button variant="ghost" size="sm" onClick={clearCanvas}>
                Limpar
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDocToSign(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSign}>Confirmar Assinatura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
