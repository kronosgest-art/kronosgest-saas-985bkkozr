import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Calendar as CalendarIcon, FileCheck, FileArchive, Clock } from 'lucide-react'

export default function PatientDashboard() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Olá, João!</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao seu portal de saúde.</p>
      </div>

      <Card className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Sua Próxima Sessão</h2>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-lg">15 de Novembro, 14:00</span>
            </div>
            <p className="mt-1 text-sm text-primary-foreground/80">
              Com Dra. Maria Silva - Limpeza Hepática
            </p>
          </div>
          <Button variant="secondary" className="w-full sm:w-auto">
            Reagendar
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Minhas Receitas', icon: FileText },
          { title: 'Calendário', icon: CalendarIcon },
          { title: 'Meus Exames', icon: FileCheck },
          { title: 'Documentos', icon: FileArchive },
        ].map((item, i) => (
          <Card
            key={i}
            className="hover:bg-primary/5 cursor-pointer transition-colors border-border/50"
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-full">
                <item.icon className="h-8 w-8 text-secondary" />
              </div>
              <span className="font-medium text-sm sm:text-base">{item.title}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                date: '10 de Outubro, 2023',
                type: 'Sessão Concluída',
                desc: 'Avaliação inicial e Bioressonância',
              },
              {
                date: '15 de Setembro, 2023',
                type: 'Exame Adicionado',
                desc: 'Hemograma completo enviado',
              },
              { date: '01 de Setembro, 2023', type: 'Consulta Online', desc: 'Triagem e anamnese' },
            ].map((ev, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 2 && (
                  <div className="absolute left-6 top-10 bottom-[-24px] w-px bg-border"></div>
                )}
                <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0 z-10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{ev.type}</h4>
                  <p className="text-sm text-muted-foreground">{ev.date}</p>
                  <p className="text-sm mt-1">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
