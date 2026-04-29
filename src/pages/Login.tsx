import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Shield, Building2, Stethoscope, User } from 'lucide-react'
import { useEffect } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const accessOptions = [
    {
      id: 'admin',
      icon: Shield,
      title: 'Admin',
      description: 'Gerenciamento geral da plataforma',
      color: '#C5A059',
      path: '/login/admin',
    },
    {
      id: 'clinica',
      icon: Building2,
      title: 'Clínica',
      description: 'Gerenciar profissionais e pacientes',
      color: '#001F3F',
      path: '/login/clinica',
    },
    {
      id: 'profissional',
      icon: Stethoscope,
      title: 'Profissional de Saúde',
      description: 'Acessar dados pessoais e pacientes',
      color: '#C5A059',
      path: '/login/profissional',
    },
    {
      id: 'paciente',
      icon: User,
      title: 'Paciente',
      description: 'Visualizar sessões e dados',
      color: '#001F3F',
      path: '/login/paciente',
    },
  ]

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FDFCF0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://img.usecurling.com/p/1920/1080?q=medical%20consultation&color=blue"
          className="w-full h-full object-cover"
          alt="Background"
        />
        <div className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-12 w-12 bg-[#C5A059] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-[#FDFCF0]">KG</span>
            </div>
            <span className="text-2xl font-bold text-[#FDFCF0] tracking-wide">KronosGest</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display text-[#FDFCF0] mb-4 max-w-4xl mx-auto leading-tight">
            Plataforma de Excelência em Saúde Integrativa
          </h1>
          <p className="text-lg md:text-xl text-[#FDFCF0]/80 max-w-2xl mx-auto">
            Acesso Seguro para Administradores, Clínicas, Profissionais e Pacientes
          </p>
        </div>

        {/* Selection Card */}
        <div
          className="bg-[#FDFCF0] border-2 border-[#C5A059] rounded-2xl p-8 w-full max-w-6xl shadow-2xl animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          <h2 className="text-2xl font-bold text-[#001F3F] text-center mb-8 font-display">
            Selecione seu tipo de acesso
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => navigate(option.path)}
                className="group relative flex flex-col items-center justify-center p-8 bg-white border border-[#C5A059]/30 rounded-xl transition-all duration-300 hover:bg-[#FDFCF0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(197,160,89,0.2)] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 lg:h-[220px]"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${option.color}15` }}
                >
                  <option.icon className="w-8 h-8" style={{ color: option.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-center" style={{ color: option.color }}>
                  {option.title}
                </h3>
                <p className="text-sm text-[#333333] text-center leading-relaxed">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-[#FDFCF0]/60 w-full mt-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
          <span>&copy; 2026 KronosGest. Todos os direitos reservados.</span>
          <div className="hidden md:block w-1 h-1 rounded-full bg-[#C5A059]"></div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#C5A059] transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-[#C5A059] transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-[#C5A059] transition-colors">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
