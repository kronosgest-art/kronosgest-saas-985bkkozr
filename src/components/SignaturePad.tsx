import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface SignaturePadProps {
  onSign: (signature: { type: 'click' | 'draw'; data: string }) => void
  patientName: string
}

export function SignaturePad({ onSign, patientName }: SignaturePadProps) {
  const [mode, setMode] = useState<'click' | 'draw' | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: any) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const handleConfirmDraw = () => {
    if (!hasDrawn) return
    const canvas = canvasRef.current
    if (!canvas) return
    onSign({ type: 'draw', data: canvas.toDataURL() })
  }

  const handleConfirmClick = () => {
    const date = new Date().toLocaleString('pt-BR')
    onSign({ type: 'click', data: `Assinado digitalmente em ${date} por ${patientName}` })
  }

  if (!mode) {
    return (
      <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
        <Label className="text-base">Escolha a forma de assinatura do paciente:</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setMode('click')}
            className="flex-1 border-primary/20"
          >
            Assinar com Clique (Rápido)
          </Button>
          <Button
            variant="outline"
            onClick={() => setMode('draw')}
            className="flex-1 border-primary/20"
          >
            Assinar com Dedo/Mouse (Desenho)
          </Button>
        </div>
      </div>
    )
  }

  if (mode === 'click') {
    return (
      <div className="space-y-4 p-4 border rounded-xl bg-muted/30 animate-in fade-in">
        <div className="p-4 bg-white border border-primary/20 rounded-md text-sm text-center font-medium text-slate-700">
          Eu, <span className="font-bold text-primary">{patientName}</span>, concordo com os termos
          e assino digitalmente este documento.
        </div>
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={() => setMode(null)}>
            Voltar
          </Button>
          <Button
            onClick={handleConfirmClick}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Confirmar Assinatura Digital
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-muted/30 animate-in fade-in">
      <Label className="text-sm font-medium">Desenhe sua assinatura abaixo:</Label>
      <div className="border-2 border-dashed border-primary/30 rounded-xl bg-white overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-[200px] touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => setMode(null)}>
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleClear}>
            Limpar
          </Button>
          <Button
            onClick={handleConfirmDraw}
            disabled={!hasDrawn}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Salvar Assinatura
          </Button>
        </div>
      </div>
    </div>
  )
}
