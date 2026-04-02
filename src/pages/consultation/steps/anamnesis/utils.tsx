import { MessageCircle, Users, Activity, Coffee, Sparkles, FileText, User } from 'lucide-react'

export const getSectionIcon = (title: string) => {
  const t = title.toLowerCase()
  if (t.includes('queixa')) return <MessageCircle className="w-5 h-5" />
  if (t.includes('histórico')) return <Users className="w-5 h-5" />
  if (t.includes('sistema') || t.includes('avaliação')) return <Activity className="w-5 h-5" />
  if (t.includes('estilo') || t.includes('hábito')) return <Coffee className="w-5 h-5" />
  if (t.includes('estética') || t.includes('beleza')) return <Sparkles className="w-5 h-5" />
  if (t.includes('observaç')) return <FileText className="w-5 h-5" />
  return <User className="w-5 h-5" />
}

export const sectionColors = [
  'text-blue-600 border-blue-200 bg-blue-50',
  'text-green-600 border-green-200 bg-green-50',
  'text-orange-600 border-orange-200 bg-orange-50',
  'text-purple-600 border-purple-200 bg-purple-50',
  'text-pink-600 border-pink-200 bg-pink-50',
  'text-gray-600 border-gray-200 bg-gray-50',
  'text-teal-600 border-teal-200 bg-teal-50',
]

export const getTooltipText = (id: string) => {
  if (id === 'dp_imc') return 'IMC = peso (kg) / altura² (m). Normal: 18,5 - 24,9'
  if (id === 'dp_rcq') return 'RCQ = cintura / quadril. Avalia risco cardiovascular.'
  if (id === 'av_gastro_bristol')
    return 'Escala de Bristol classifica a forma das fezes em 7 tipos.'
  return null
}

export const shouldShowQuestion = (q: any, index: number, perguntas: any[], answers: any) => {
  const lowerTitle = (q.titulo || '').toLowerCase()
  const isDependent =
    lowerTitle.includes('especifique') ||
    lowerTitle.includes('descrição') ||
    lowerTitle.includes('outros')

  if (!isDependent) return true

  if (index > 0) {
    const prevQ = perguntas[index - 1]
    const prevAns = answers[prevQ.id]
    if (prevAns === undefined || prevAns === null || prevAns === '') return false
    if (Array.isArray(prevAns) && prevAns.length === 0) return false
    if (prevAns === 'Não' || prevAns === false) return false
  }
  return true
}

export const validateSection = (section: any, answers: any) => {
  if (!section) return true
  let isValid = true
  section.perguntas.forEach((q: any) => {
    if (q.obrigatoria) {
      const val = answers[q.id]
      if (
        val === undefined ||
        val === null ||
        val === '' ||
        (Array.isArray(val) && val.length === 0)
      ) {
        isValid = false
      }
    }
  })
  return isValid
}
