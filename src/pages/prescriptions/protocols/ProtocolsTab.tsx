import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Loader2 } from 'lucide-react'
import ProtocolDashboard from './ProtocolDashboard'
import ProtocolList from './ProtocolList'
import ProtocolFormModal from './ProtocolFormModal'
import { useProtocols, Protocol } from './use-protocols'
import { SellProtocolDialog } from '@/pages/protocols/SellProtocolDialog'

export default function ProtocolsTab() {
  const { protocols, loading, saveProtocol, deleteProtocol } = useProtocols()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null)
  const [sellingProtocol, setSellingProtocol] = useState<Protocol | null>(null)

  const handleOpenModal = (protocol?: Protocol) => {
    setEditingProtocol(protocol || null)
    setIsModalOpen(true)
  }

  const handleDuplicate = (protocol: Protocol) => {
    const copy = { ...protocol, nome: `${protocol.nome} (Cópia)`, is_padrao: false }
    delete copy.id
    delete copy.created_at
    delete copy.vezes_prescrito
    setEditingProtocol(copy)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ProtocolDashboard protocols={protocols} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-primary/10 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3 w-full">
          <div className="relative w-full sm:w-auto flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar protocolos..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="Limpeza do Terreno">Limpeza do Terreno</SelectItem>
              <SelectItem value="Desparasitação">Desparasitação</SelectItem>
              <SelectItem value="Detox">Detox</SelectItem>
              <SelectItem value="Suplementação">Suplementação</SelectItem>
            </SelectContent>
          </Select>
          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Duração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer Duração</SelectItem>
              <SelectItem value="7 dias">7 dias</SelectItem>
              <SelectItem value="14 dias">14 dias</SelectItem>
              <SelectItem value="21 dias">21 dias</SelectItem>
              <SelectItem value="30 dias">30 dias</SelectItem>
              <SelectItem value="Contínuo">Contínuo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenModal()} className="shrink-0 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo Protocolo
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <ProtocolList
          protocols={protocols}
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          durationFilter={durationFilter}
          onEdit={handleOpenModal}
          onDuplicate={handleDuplicate}
          onDelete={deleteProtocol}
          onSell={setSellingProtocol}
        />
      )}

      <SellProtocolDialog
        protocol={sellingProtocol}
        open={!!sellingProtocol}
        onOpenChange={(open) => !open && setSellingProtocol(null)}
      />

      <ProtocolFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProtocol}
        onSave={saveProtocol}
      />
    </div>
  )
}
