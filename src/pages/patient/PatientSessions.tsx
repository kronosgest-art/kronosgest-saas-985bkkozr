import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, Calendar, CheckCircle, PenTool, Clock } from 'lucide-react'
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
import { cn } from '@/lib/utils'

export default function PatientSessions() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sessoes, setSessoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionToSign, setSessionToSign] = useState<any>(null)

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
        const { data } = await supabase
          .from('agendamentos')
          .select('*, profissionais(nome_completo)')
          .eq('patient_id', patient.id)
          .order('data', { ascending: true })
        if (data) setSessoes(data)
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

  const stopDrawing = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSignSession = async () => {
    if (!sessionToSign) return
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureImage = canvas.toDataURL('image/png')

    const { error } = await supabase
      .from('agendamentos')
      .update({
        assinatura_paciente: signatureImage,
        data_assinatura: new Date().toISOString(),
        status: 'Realizada',
      } as any)
      .eq('id', sessionToSign.id)

    if (!error) {
      setSessoes(
        sessoes.map((s) =>
          s.id === sessionToSign.id
            ? {
                ...s,
                assinatura_paciente: signatureImage,
                data_assinatura: new Date().toISOString(),
                status: 'Realizada',
              }
            : s,
        ),
      )
      setSessionToSign(null)
      toast({ title: 'Presença confirmada com sucesso!' })
    } else {
      toast({ title: 'Erro ao confirmar presença', variant: 'destructive' })
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
      <h1 className="text-3xl font-bold text-primary tracking-tight">Minhas Sessões</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessoes.map((s) => {
          const isSigned = !!s.assinatura_paciente
          const isPast = new Date(`${s.data}T${s.horario}`) < new Date()

          return (
            <Card
              key={s.id}
              className={cn(
                'shadow-sm flex flex-col transition-all',
                isSigned && 'border-green-200 bg-green-50/10',
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> {s.tipo_consulta}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(s.data).toLocaleDateString('pt-BR')} às {s.horario}
                  </p>
                  {s.profissionais?.nome_completo && (
                    <p className="mt-2">
                      <strong>Profissional:</strong> {s.profissionais.nome_completo}
                    </p>
                  )}
                </div>
                <div className="pt-2">
                  <Badge
                    variant={
                      s.status === 'Realizada'
                        ? 'default'
                        : s.status === 'Cancelado'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {s.status || 'Agendado'}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t mt-auto">
                <div className="w-full mt-4">
                  {isSigned ? (
                    <div className="flex items-center justify-center text-sm font-medium text-green-600 bg-green-100 py-2.5 rounded-md border border-green-200">
                      <CheckCircle className="h-4 w-4 mr-2" /> Presença Confirmada
                    </div>
                  ) : (
                    <Button
                      className="w-full shadow-sm"
                      variant={isPast ? 'default' : 'outline'}
                      onClick={() => setSessionToSign(s)}
                      disabled={s.status === 'Cancelado'}
                    >
                      <PenTool className="h-4 w-4 mr-2" /> Assinar Presença
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )
        })}
        {sessoes.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed bg-secondary/10">
            Nenhuma sessão agendada.
          </div>
        )}
      </div>

      <Dialog open={!!sessionToSign} onOpenChange={(o) => !o && setSessionToSign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Presença</DialogTitle>
            <DialogDescription>
              Assine abaixo para confirmar sua presença na sessão de {sessionToSign?.tipo_consulta}{' '}
              do dia {sessionToSign ? new Date(sessionToSign.data).toLocaleDateString('pt-BR') : ''}
              .
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-md bg-secondary/20 p-2 flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-2 w-full text-left font-medium">
              Desenhe sua assinatura:
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
            <Button variant="outline" onClick={() => setSessionToSign(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSignSession}>Confirmar Assinatura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
