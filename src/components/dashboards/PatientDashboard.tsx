import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, FileText, CalendarCheck, Activity, Pill } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PatientDashboard() {
  const links = [
    {
      title: 'Minhas Sessões',
      desc: 'Acompanhe e assine suas presenças',
      icon: CalendarCheck,
      href: '/patient/sessions',
      color: 'text-blue-500',
    },
    {
      title: 'Meus Documentos',
      desc: 'Termos, contratos e anamneses',
      icon: FileText,
      href: '/patient/documents',
      color: 'text-purple-500',
    },
    {
      title: 'Meus Exames',
      desc: 'Resultados e laudos médicos',
      icon: Activity,
      href: '/patient/exams',
      color: 'text-rose-500',
    },
    {
      title: 'Prescrições',
      desc: 'Receitas e recomendações',
      icon: Pill,
      href: '/patient/prescriptions',
      color: 'text-emerald-500',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Minha Ficha Clínica</h1>

      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Bem-vindo(a) ao seu portal</CardTitle>
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aqui você tem acesso completo ao seu histórico de tratamentos, sessões e documentos
            importantes.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {links.map((link) => (
          <Link key={link.href} to={link.href} className="block group">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full border-transparent group-hover:border-primary/20">
              <CardHeader className="pb-2">
                <link.icon
                  className={`h-8 w-8 ${link.color} mb-2 transition-transform group-hover:scale-110 duration-300`}
                />
                <CardTitle className="text-lg">{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
