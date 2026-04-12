import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export default function Step7Referral() {
  const { user } = useAuth()
  const [profData, setProfData] = useState<any>(null)
  const [orgData, setOrgData] = useState<any>(null)

  const [especialidade, setEspecialidade] = useState('Hepatologia / Gastroenterologia')
  const [motivo, setMotivo] = useState(
    'Encaminho paciente para avaliação especializada devido a marcadores elevados indicativos de esteatose hepática severa observados em triagem.',
  )
  const [exames, setExames] = useState('Ultrassonografia de abdome total, TGO, TGP, Gama GT.')

  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    script.async = true
    document.body.appendChild(script)

    const fetchData = async () => {
      if (!user) return
      const { data: prof } = await supabase
        .from('profissionais')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (prof) {
        setProfData(prof)
        if (prof.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', prof.organization_id)
            .single()
          if (org) setOrgData(org)
        }
      }
    }
    fetchData()

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [user])

  const handlePrint = async () => {
    const element = document.getElementById('print-content')
    if (element && (window as any).html2pdf) {
      setIsGenerating(true)
      element.style.display = 'block'
      const opt = {
        margin: 15,
        filename: 'Encaminhamento_Medico.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }
      try {
        await (window as any).html2pdf().set(opt).from(element).save()
      } finally {
        element.style.display = 'none'
        setIsGenerating(false)
      }
    } else {
      window.print()
    }
  }

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const local = orgData?.endereco ? orgData.endereco.split(',')[0] : 'Consultório'

  return (
    <div className="space-y-6 animate-slide-in-right max-w-2xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Encaminhamento Médico</h2>
          <p className="text-muted-foreground">
            Necessário quando identificados riscos clínicos além da especialidade.
          </p>
        </div>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="shrink-0 font-medium"
          disabled={isGenerating}
        >
          {isGenerating ? '⏳ Gerando...' : '🖨️ Imprimir PDF'}
        </Button>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          A IA detectou alterações severas na Bioressonância (Fígado) que podem requerer avaliação
          de um Hepatologista.
        </AlertDescription>
      </Alert>

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label>Especialidade Solicitada</Label>
          <Input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Motivo do Encaminhamento</Label>
          <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} />
        </div>

        <div className="space-y-2">
          <Label>Exames Sugeridos para o Médico</Label>
          <Textarea value={exames} onChange={(e) => setExames(e.target.value)} rows={3} />
        </div>
      </div>

      {/* Hidden Print Content */}
      <div
        id="print-content"
        style={{ display: 'none' }}
        className="p-8 bg-white text-black text-sm"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-6">
          <div className="flex items-center gap-6">
            {orgData?.logo_url && (
              <img
                src={orgData.logo_url}
                alt="Logo"
                className="w-24 h-24 object-contain"
                crossOrigin="anonymous"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold uppercase text-gray-900">
                {orgData?.nome || 'Clínica Integrativa'}
              </h1>
              {orgData?.cnpj && <p className="text-gray-700">CNPJ: {orgData.cnpj}</p>}
              <p className="text-gray-700">
                {orgData?.telefone ? `Tel: ${orgData.telefone} ` : ''}
                {orgData?.email ? `| Email: ${orgData.email}` : ''}
              </p>
              {orgData?.endereco && <p className="text-gray-700">{orgData.endereco}</p>}
            </div>
          </div>
        </div>

        {/* Identificação do Profissional */}
        <div className="mb-8 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Profissional Solicitante</h2>
          <div className="grid grid-cols-2 gap-2 text-gray-800">
            <p>
              <strong>Nome:</strong> {profData?.nome_completo || 'Não identificado'}
            </p>
            <p>
              <strong>Especialidade:</strong> {profData?.especialidade || 'Clínico Geral'}
            </p>
            <p>
              <strong>Registro:</strong> {profData?.tipo_registro || 'CR'}{' '}
              {profData?.numero_registro || profData?.cpf || 'N/A'}
            </p>
          </div>
        </div>

        {/* Título do Documento */}
        <h2 className="text-2xl font-bold text-center uppercase mb-8 mt-6 text-gray-900">
          Encaminhamento Médico
        </h2>

        {/* Corpo do Encaminhamento */}
        <div className="space-y-6 text-base leading-relaxed mb-16 text-gray-900">
          <p className="text-lg">
            <strong>Para a especialidade de:</strong> {especialidade}
          </p>

          <div className="bg-white">
            <strong className="text-lg">Motivo do Encaminhamento:</strong>
            <p className="mt-2 whitespace-pre-wrap p-4 border border-gray-200 rounded-md min-h-[100px]">
              {motivo}
            </p>
          </div>

          <div className="bg-white">
            <strong className="text-lg">Exames / Avaliações Sugeridas:</strong>
            <p className="mt-2 whitespace-pre-wrap p-4 border border-gray-200 rounded-md min-h-[80px]">
              {exames}
            </p>
          </div>
        </div>

        {/* Assinatura e Data */}
        <div className="mt-32 flex flex-col items-center justify-center text-gray-900">
          <p className="mb-16 text-lg">
            {local}, {dataAtual}
          </p>
          <div className="w-80 border-t border-black mb-2"></div>
          <p className="font-bold text-lg">
            {profData?.nome_completo || 'Assinatura do Profissional'}
          </p>
          <p className="text-gray-600">
            {profData?.tipo_registro || 'CR'} {profData?.numero_registro || profData?.cpf || ''}
          </p>
        </div>
      </div>
    </div>
  )
}
