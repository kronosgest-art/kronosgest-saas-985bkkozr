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
      path: '/login/admin',
    },
    {
      id: 'clinica',
      icon: Building2,
      title: 'Clínica',
      description: 'Gerenciar profissionais e pacientes',
      path: '/login/clinica',
    },
    {
      id: 'profissional',
      icon: Stethoscope,
      title: 'Profissional',
      description: 'Acessar dados pessoais e pacientes',
      path: '/login/profissional',
    },
    {
      id: 'paciente',
      icon: User,
      title: 'Paciente',
      description: 'Visualizar sessões e dados',
      path: '/login/paciente',
    },
  ]

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#001F3F]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#001F3F] flex flex-col font-sans relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#C5A059]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#C5A059]/5 blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Header Logo */}
        <div className="text-center mb-16 animate-fade-in-up">
          <img
            src="/logo.png"
            alt="Logomarca KronosGest"
            className="h-16 md:h-20 object-contain mx-auto drop-shadow-lg"
            onError={(e) => {
              e.currentTarget.src =
                'https://img.usecurling.com/p/300/80?q=luxury%20gold%20logo&color=black'
            }}
          />
        </div>

        {/* Selection Area */}
        <div className="w-full max-w-5xl animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-sm md:text-base font-medium text-[#C5A059] text-center mb-8 tracking-[0.2em] uppercase">
            Selecione seu tipo de acesso
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => navigate(option.path)}
                className="group relative flex flex-col items-center justify-center p-8 bg-[#FFFFFF] border border-transparent rounded-2xl transition-all duration-500 hover:bg-[#FDFCF0] hover:-translate-y-2 hover:border-[#C5A059]/40 hover:shadow-[0_15px_40px_-10px_rgba(197,160,89,0.15)] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#001F3F] lg:h-[240px]"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-[#C5A059]/10 text-[#C5A059] transition-transform duration-500 group-hover:scale-110 group-hover:bg-[#C5A059] group-hover:text-[#FFFFFF]">
                  <option.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-[#001F3F] text-center transition-colors">
                  {option.title}
                </h3>
                <p className="text-sm text-[#333333]/80 text-center leading-relaxed">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-[#FDFCF0]/40 w-full mt-auto animate-fade-in">
        <div className="flex flex-col items-center justify-center gap-3 text-xs">
          <p className="tracking-wider uppercase opacity-70 max-w-2xl px-4">
            Acesso Seguro para Administradores, Clínicas, Profissionais e Pacientes
          </p>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2">
            <span>&copy; 2026 KronosGest. Todos os direitos reservados.</span>
            <div className="hidden md:block w-1 h-1 rounded-full bg-[#C5A059]/50"></div>
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
        </div>
      </footer>
    </div>
  )
}
