import { useState } from 'react'
import { Tag } from '../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tags: Tag[]
  onSave: (id: string | null, data: Omit<Tag, 'id'>) => void
  onDelete: (id: string) => void
}

const COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-yellow-100 text-yellow-800',
  'bg-green-100 text-green-800',
  'bg-orange-100 text-orange-800',
  'bg-red-100 text-red-800',
  'bg-emerald-100 text-emerald-800',
  'bg-gray-100 text-gray-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
]

export function TagManagerDialog({
  open,
  onOpenChange,
  tags,
  onSave,
  onDelete,
}: TagManagerDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState(COLORS[0])

  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
    setIsCreating(false)
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onSave(editingId, { name: editName, color: editColor })
      setEditingId(null)
    }
  }

  const saveNew = () => {
    if (newName.trim()) {
      onSave(null, { name: newName, color: newColor })
      setIsCreating(false)
      setNewName('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Etiquetas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
          {!isCreating && !editingId && (
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full border-dashed border-2 border-[#C5A059] bg-transparent hover:bg-[#C5A059]/10 text-[#C5A059]"
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Etiqueta
            </Button>
          )}

          {isCreating && (
            <div className="p-3 border rounded-md bg-muted/30 space-y-3 animate-fade-in">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da etiqueta"
                className="focus-visible:ring-[#C5A059]"
              />
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={cn(
                      'w-6 h-6 rounded-full',
                      c.split(' ')[0],
                      newColor === c && 'ring-2 ring-offset-2 ring-[#C5A059]',
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={saveNew}
                  className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors"
              >
                {editingId === tag.id ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm focus-visible:ring-[#C5A059]"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={cn(
                            'w-5 h-5 rounded-full',
                            c.split(' ')[0],
                            editColor === c && 'ring-2 ring-offset-1 ring-[#C5A059]',
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn('border-transparent font-normal', tag.color)}
                  >
                    {tag.name}
                  </Badge>
                )}

                <div className="flex items-center gap-1 ml-4">
                  {editingId === tag.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(null)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={saveEdit}
                        className="h-8 w-8 text-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(tag)}
                        className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(tag.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
