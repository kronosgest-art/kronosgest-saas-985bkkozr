import { useState, useRef, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { UploadCloud, Search, Loader2, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { analyzeExames } from '@/services/ai-functions'

const mockExams = [
  { test: 'Glicemia de Jejum', value: 115, ref: '70-99 mg/dL', status: 'Alto', critical: true },
  { test: 'Colesterol Total', value: 180, ref: '< 190 mg/dL', status: 'Normal', critical: false },
  { test: 'Vitamina D3', value: 22, ref: '30-100 ng/mL', status: 'Baixo', critical: true },
  { test: 'TSH', value: 2.5, ref: '0.4-4.0 mIU/L', status: 'Normal', critical: false },
]

export default function Step5Exams() {
  const [searchTerm, setSearchTerm] = useState('')

  // IA Exames States
  const [patientId, setPatientId] = useState<string>('00000000-0000-0000-0000-000000000000')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase
      .from('patients')
      .select('id')
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setPatientId(data[0].id)
      })
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo excede o limite de 10MB.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Por favor, envie apenas arquivos no formato PDF.')
      return
    }

    setError(null)
    setIsAnalyzing(true)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1]
        const res = await analyzeExames(base64String, patientId, 'laboratorial')

        if (res.error) {
          setError('Erro de conexão ao processar arquivo.')
        } else if (res.data?.error) {
          setError(res.data.error)
        } else {
          setAnalysisResult(res.data?.data)
          setPdfUrl(res.data?.pdf_url)
        }
      } catch (err) {
        setError('Erro inesperado ao analisar o exame.')
      } finally {
        setIsAnalyzing(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#1E3A8A' }}>
            Exames Laboratoriais
          </h2>
          <p className="text-muted-foreground">Integração de resultados via PDF com IA.</p>
        </div>
        <div>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            style={{ backgroundColor: '#B8860B', color: '#FFFFFF' }}
            className="hover:opacity-90"
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? 'Processando...' : '📤 Upload Exame Laboratorial'}
          </Button>
          <p className="text-xs text-right text-slate-500 mt-1">Apenas PDF (máx 10MB)</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">{error}</p>
      )}

      {analysisResult && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-6 animate-fade-in-up">
          <h4 className="font-medium flex items-center mb-4" style={{ color: '#1E3A8A' }}>
            <FileText className="w-5 h-5 mr-2" /> Interpretação da IA
          </h4>
          <div className="space-y-4 text-sm">
            {analysisResult.alerta && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md border border-red-200 font-medium">
                🚨 Alerta: {analysisResult.alerta}
              </div>
            )}
            <div>
              <strong className="block text-slate-700 mb-1">Valores Alterados:</strong>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                {analysisResult.valores_alterados?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong className="block text-slate-700 mb-1">Interpretação Clínica:</strong>
              <p className="text-slate-600 bg-white p-3 rounded border">
                {analysisResult.interpretacao}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 pt-4 border-t gap-4">
            <span className="text-xs font-medium" style={{ color: '#1E3A8A' }}>
              ⚠️ Resultados devem ser interpretados por profissional habilitado
            </span>
            {pdfUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  📥 Download PDF Analisado
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 mt-8">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar exame histórico..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-lg overflow-hidden mt-4">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Teste</TableHead>
              <TableHead>Valor Encontrado</TableHead>
              <TableHead>Referência Ideal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockExams
              .filter((e) => e.test.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((exam, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{exam.test}</TableCell>
                  <TableCell className={exam.critical ? 'text-destructive font-bold' : ''}>
                    {exam.value}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{exam.ref}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${exam.status === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {exam.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
