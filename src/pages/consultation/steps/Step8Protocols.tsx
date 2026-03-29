import { useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

const protocolDB: Record<string, { ativos: string; duracao: string }> = {
  hepatica: {
    ativos: 'Sal Amargo, Azeite Extravirgem, Suco de Toranja',
    duracao: '7 dias (preparação) + 1 dia (limpeza)',
  },
  parasita: { ativos: 'Tintura de Cravo, Absinto, Tintura de Noz Negra', duracao: '21 dias' },
  detox: { ativos: 'Clorela, Zeólita, Carvão Ativado', duracao: '14 dias' },
}

export default function Step8Protocols() {
  const [selected, setSelected] = useState<string>('hepatica')

  return (
    <div className="space-y-6 animate-slide-in-right max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Protocolos de Limpeza</h2>
        <p className="text-muted-foreground">Selecione e personalize protocolos padrão.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Protocolo Base</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hepatica">Limpeza Hepática e Biliar</SelectItem>
              <SelectItem value="parasita">Desparasitação Profunda</SelectItem>
              <SelectItem value="detox">Detox de Metais Pesados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ativos Utilizados (Editável)</Label>
          <Textarea value={protocolDB[selected]?.ativos} rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Duração do Tratamento</Label>
          <Input value={protocolDB[selected]?.duracao} />
        </div>
      </div>
    </div>
  )
}
