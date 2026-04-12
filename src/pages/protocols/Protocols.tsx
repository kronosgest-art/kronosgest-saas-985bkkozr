import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SellProtocolDialog } from '@/components/protocols/SellProtocolDialog'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, ShoppingCart } from 'lucide-react'

export default function Protocols() {
  const [protocolos, setProtocolos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProtocolos() {
      const { data } = await supabase.from('protocolos').select('*').order('nome')
      if (data) setProtocolos(data)
      setLoading(false)
    }
    loadProtocolos()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Protocolos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e venda seus protocolos clínicos de forma integrada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Novo Protocolo
          </Button>
          <SellProtocolDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {protocolos.map((protocolo) => (
          <Card
            key={protocolo.id}
            className="flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-xl line-clamp-1">{protocolo.nome}</CardTitle>
                {protocolo.is_padrao && <Badge variant="secondary">Padrão</Badge>}
              </div>
              <CardDescription>{protocolo.tipo || 'Protocolo Clínico'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Duração:</strong> {protocolo.duracao || 'Não especificada'}
                </p>
                <p className="line-clamp-2">
                  <strong>Descrição:</strong> {protocolo.descricao || 'Sem descrição'}
                </p>
                <p className="text-lg font-bold text-primary mt-2">
                  {protocolo.valor_total
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        protocolo.valor_total,
                      )
                    : 'Valor não definido'}
                </p>
              </div>

              <SellProtocolDialog
                trigger={
                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white transition-colors"
                    variant="secondary"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Vender Este Protocolo
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ))}

        {protocolos.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhum protocolo encontrado. Crie um novo protocolo para começar.
          </div>
        )}
      </div>
    </div>
  )
}
