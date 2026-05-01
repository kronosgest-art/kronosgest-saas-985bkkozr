import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { QrCode, Smartphone, Wifi, WifiOff, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react'

export default function WhatsAppConnection() {
  const { toast } = useToast()
  const [status, setStatus] = useState<'offline' | 'loading' | 'qr_ready' | 'online'>('offline')
  const [qrCode, setQrCode] = useState<string | null>(null)

  const handleConnect = () => {
    setStatus('loading')
    // Simula a requisição para a Evolution API para buscar o QR Code
    setTimeout(() => {
      // Imagem placeholder representando o retorno em base64 da API
      setQrCode('https://img.usecurling.com/p/256/256?q=qrcode')
      setStatus('qr_ready')

      // Simula a confirmação de leitura do QR code (mock automático do websocket)
      setTimeout(() => {
        setStatus('online')
        toast({
          title: 'WhatsApp Conectado!',
          description:
            'Sua instância foi autenticada com sucesso. Sincronizando as últimas mensagens...',
        })
      }, 5000)
    }, 2000)
  }

  const handleDisconnect = () => {
    setStatus('offline')
    setQrCode(null)
    toast({
      title: 'WhatsApp Desconectado',
      description: 'Sessão encerrada com sucesso.',
    })
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Smartphone className="h-5 w-5 text-[#001F3F]" />
          Integração WhatsApp
        </CardTitle>
        <CardDescription>
          Conecte seu dispositivo via Evolution API para ativar o atendimento via IA e gerenciar
          conversas direto no CRM.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-gradient-to-r from-muted/50 to-muted/10">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full flex items-center justify-center transition-colors ${
                status === 'online'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              {status === 'online' ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {status === 'online'
                  ? 'Conectado'
                  : status === 'loading'
                    ? 'Iniciando Instância...'
                    : status === 'qr_ready'
                      ? 'Aguardando Leitura'
                      : 'Desconectado'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {status === 'online'
                  ? 'Instância ativa. Mensagens sendo sincronizadas em tempo real.'
                  : 'Nenhuma instância do WhatsApp conectada no momento.'}
              </p>
            </div>
          </div>

          {status === 'online' && (
            <Button variant="destructive" onClick={handleDisconnect} className="shrink-0">
              <LogOut className="h-4 w-4 mr-2" />
              Desconectar Aparelho
            </Button>
          )}
        </div>

        {(status === 'offline' || status === 'loading') && (
          <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-xl bg-card transition-all">
            <div className="bg-muted p-4 rounded-full mb-4">
              <QrCode className="h-10 w-10 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">Conecte seu Aparelho</h4>
            <p className="text-center text-muted-foreground max-w-md mb-6">
              Ao conectar, o KronosGest poderá enviar mensagens automáticas, gerar respostas via IA
              e centralizar os atendimentos dos seus leads.
            </p>
            <Button
              onClick={handleConnect}
              disabled={status === 'loading'}
              size="lg"
              className="bg-[#001F3F] hover:bg-[#001F3F]/90 text-white min-w-[200px]"
            >
              {status === 'loading' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>Gerar QR Code</>
              )}
            </Button>
          </div>
        )}

        {status === 'qr_ready' && qrCode && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5 animate-fade-in">
            <div className="text-center space-y-2 mb-6">
              <h4 className="font-semibold text-xl text-[#001F3F]">Escaneie o QR Code</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Abra o WhatsApp no seu celular, toque em{' '}
                <strong className="text-foreground">Configurações &gt; Aparelhos Conectados</strong>{' '}
                e aponte a câmera para o código abaixo.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-md border mb-6 relative">
              <img
                src={qrCode}
                alt="QR Code WhatsApp"
                className="w-64 h-64 object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 pointer-events-none rounded-2xl ring-1 ring-inset ring-black/5" />
            </div>

            <Button variant="outline" onClick={handleDisconnect} className="text-muted-foreground">
              Cancelar
            </Button>
          </div>
        )}

        {status === 'online' && (
          <div className="p-6 border rounded-xl bg-card animate-fade-in-up">
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Sincronização Ativa
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border">
                <p className="text-sm text-muted-foreground mb-1">Última Sincronização</p>
                <p className="font-medium text-foreground">Agora mesmo</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border">
                <p className="text-sm text-muted-foreground mb-1">Mensagens Processadas</p>
                <p className="font-medium text-foreground">30 últimas mensagens</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border">
                <p className="text-sm text-muted-foreground mb-1">Status da IA</p>
                <p className="font-medium text-green-600 dark:text-green-500">
                  Respondendo Ativamente
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
