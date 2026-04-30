import { useState, useEffect } from 'react'
import { Tab, Tag } from '../types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TabDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tabId: string | null
  tabs: Tab[]
  tags: Tag[]
  onSave: (id: string | null, data: Omit<Tab, 'id'>) => void
  onDelete: (id: string) => void
}

export function TabDialog({
  open,
  onOpenChange,
  tabId,
  tabs,
  tags,
  onSave,
  onDelete,
}: TabDialogProps) {
  const [name, setName] = useState('')
  const [tagId, setTagId] = useState<string>('none')

  useEffect(() => {
    if (open) {
      if (tabId) {
        const tab = tabs.find((t) => t.id === tabId)
        setName(tab?.name || '')
        setTagId(tab?.tagId || 'none')
      } else {
        setName('')
        setTagId('none')
      }
    }
  }, [open, tabId, tabs])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(tabId, { name, tagId: tagId === 'none' ? null : tagId })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tabId ? 'Editar Aba' : 'Nova Aba'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Aba</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Novos Leads"
              className="focus-visible:ring-[#C5A059]"
            />
          </div>
          <div className="space-y-2">
            <Label>Filtrar por Etiqueta</Label>
            <Select value={tagId} onValueChange={setTagId}>
              <SelectTrigger className="focus:ring-[#C5A059]">
                <SelectValue placeholder="Selecione uma etiqueta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todas as etiquetas (Sem filtro)</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between items-center flex-row-reverse">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white">
              Salvar
            </Button>
          </div>
          {tabId && (
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(tabId)
                onOpenChange(false)
              }}
            >
              Excluir Aba
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
