import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { UploadCloud, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const mockExams = [
  { test: 'Glicemia de Jejum', value: 115, ref: '70-99 mg/dL', status: 'Alto', critical: true },
  { test: 'Colesterol Total', value: 180, ref: '< 190 mg/dL', status: 'Normal', critical: false },
  { test: 'Vitamina D3', value: 22, ref: '30-100 ng/mL', status: 'Baixo', critical: true },
  { test: 'TSH', value: 2.5, ref: '0.4-4.0 mIU/L', status: 'Normal', critical: false },
]

export default function Step5Exams() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Exames Laboratoriais</h2>
          <p className="text-muted-foreground">Integração de resultados via PDF com IA.</p>
        </div>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-4 w-4" /> Importar PDF
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar exame..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
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
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        exam.status === 'Normal'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
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
