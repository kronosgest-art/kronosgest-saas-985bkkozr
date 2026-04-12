import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Loader2, RefreshCw, Eye, Pill, Printer, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import ProtocolsTab from './protocols/ProtocolsTab'

export default function PrescriptionsList() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewingPrescription, setViewingPrescription] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions()
    }
  }, [user?.id])

  const fetchPrescriptions = async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const { data: patientsData } = await supabase
        .from('pacientes')
        .select('id, nome_completo, cpf')
        .or(`user_id.eq.${user.id},organization_id.eq.${user.id}`)

      if (patientsData && patientsData.length > 0) {
        const patientIds = patientsData.map((p) => p.id)

        const { data: prescriptionsData } = await supabase
          .from('prescricoes')
          .select('*')
          .in('patient_id', patientIds)
          .order('created_at', { ascending: false })

        if (prescriptionsData) {
          const enrichedPrescriptions = prescriptionsData.map((pr) => {
            const patient = patientsData.find((p) => p.id === pr.patient_id)
            return { ...pr, patient }
          })
          setPrescriptions(enrichedPrescriptions)
        }
      } else {
        setPrescriptions([])
      }
    } catch (error: any) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = (prescriptionText: string) => {
    if (!prescriptionText) return
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receituário Médico</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; color: #1E3A8A; }
              .content { white-space: pre-wrap; font-size: 14px; }
              .footer { margin-top: 50px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666; }
              .signature { margin-top: 80px; text-align: center; }
              .signature-line { width: 300px; border-bottom: 1px solid #333; margin: 0 auto 10px auto; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Receituário</h1>
              <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="content">${prescriptionText}</div>
            <div class="signature"><div class="signature-line"></div><p>Assinatura do Profissional</p></div>
            <div class="footer">Documento de uso clínico.</div>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const filteredPrescriptions = prescriptions.filter((p) =>
    p.patient?.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Tabs defaultValue="prescriptions" className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
              <Pill className="w-8 h-8" /> Prescrições & Protocolos
            </h2>
            <p className="text-muted-foreground">
              Gestão de receituários de pacientes e biblioteca de protocolos.
            </p>
          </div>
          <TabsList className="bg-primary/5">
            <TabsTrigger
              value="prescriptions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="w-4 h-4 mr-2" /> Minhas Prescrições
            </TabsTrigger>
            <TabsTrigger
              value="protocols"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Pill className="w-4 h-4 mr-2" /> Biblioteca de Protocolos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="prescriptions" className="mt-0">
          <Card className="border-primary/10 shadow-sm bg-white">
            <CardHeader className="bg-transparent border-b border-primary/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary">Lista de Prescrições</CardTitle>
                <CardDescription>Busque por paciente para ver seu histórico.</CardDescription>
              </div>
              <Button variant="outline" onClick={fetchPrescriptions} disabled={isLoading} size="sm">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}{' '}
                Recarregar
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-primary/5">
                <div className="relative max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-primary/5 text-primary border-b border-primary/10">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Data</th>
                      <th className="px-6 py-4 font-semibold">Paciente</th>
                      <th className="px-6 py-4 font-semibold">CPF</th>
                      <th className="px-6 py-4 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </td>
                      </tr>
                    ) : filteredPrescriptions.length > 0 ? (
                      filteredPrescriptions.map((prescription) => (
                        <tr
                          key={prescription.id}
                          className="border-b border-primary/5 last:border-0 hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {new Date(prescription.created_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(prescription.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-slate-800 font-medium">
                            {prescription.patient?.nome_completo || 'Desconhecido'}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {prescription.patient?.cpf || '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePrint(prescription.conteudo_json?.prescricao)}
                              >
                                <Printer className="w-4 h-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewingPrescription(prescription)}
                              >
                                <Eye className="w-4 h-4 text-primary" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          Nenhuma prescrição encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="mt-0">
          <ProtocolsTab />
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewingPrescription} onOpenChange={(o) => !o && setViewingPrescription(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Pill className="w-5 h-5" /> Prescrição -{' '}
              {viewingPrescription?.patient?.nome_completo}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Data:{' '}
              {viewingPrescription &&
                new Date(viewingPrescription.created_at).toLocaleDateString('pt-BR')}
            </p>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/30">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {viewingPrescription?.conteudo_json?.prescricao || 'Indisponível.'}
              </pre>
            </ScrollArea>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setViewingPrescription(null)}>
              Fechar
            </Button>
            <Button onClick={() => handlePrint(viewingPrescription?.conteudo_json?.prescricao)}>
              <Printer className="w-4 h-4 mr-2" /> Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
