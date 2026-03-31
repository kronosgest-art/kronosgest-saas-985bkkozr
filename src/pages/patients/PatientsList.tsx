import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const mockPatients = [
  {
    id: 1,
    name: 'Ana Silva',
    cpf: '111.222.333-44',
    status: 'Ativo',
    lastConsultation: '15/10/2023',
  },
  {
    id: 2,
    name: 'Carlos Oliveira',
    cpf: '555.666.777-88',
    status: 'Inativo',
    lastConsultation: '02/08/2023',
  },
  {
    id: 3,
    name: 'Mariana Costa',
    cpf: '999.000.111-22',
    status: 'Ativo',
    lastConsultation: '20/10/2023',
  },
]

export default function PatientsList() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPatients = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Pacientes</h2>
          <p className="text-muted-foreground">Gerencie os pacientes da clínica.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>Visualize e busque todos os pacientes cadastrados.</CardDescription>
          <div className="mt-4 flex max-w-sm items-center space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">CPF</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Última Consulta</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{patient.name}</td>
                      <td className="px-4 py-3">{patient.cpf}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={patient.status === 'Ativo' ? 'default' : 'secondary'}
                          className={
                            patient.status === 'Ativo'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-400'
                          }
                        >
                          {patient.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{patient.lastConsultation}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum paciente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
