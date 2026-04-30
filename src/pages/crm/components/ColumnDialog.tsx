import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Column } from '../types'

interface ColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnId: string | null
  columns: Column[]
  onSave: (id: string | null, data: Omit<Column, 'id'>) => void
}

export function ColumnDialog({ open, onOpenChange, columnId, columns, onSave }: ColumnDialogProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) {
      if (columnId) {
        const col = columns.find((c) => c.id === columnId)
        setName(col?.name || '')
      } else {
        setName('')
      }
    }
  }, [open, columnId, columns])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(columnId, { name })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{columnId ? 'Editar Coluna' : 'Nova Coluna'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Coluna</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Em Negociação"
              className="focus-visible:ring-[#C5A059]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
