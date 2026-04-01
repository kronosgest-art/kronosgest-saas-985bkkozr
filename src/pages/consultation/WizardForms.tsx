import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

export function StepCadastro({ data, onChange }: any) {
  return (
    <div className="space-y-6 w-full max-w-xl mx-auto text-left animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome Completo *</Label>
          <Input
            placeholder="Ex: João da Silva"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          />
        </div>
        <div className="space-y-2">
          <Label>CPF *</Label>
          <Input
            placeholder="000.000.000-00"
            value={data.cpf}
            onChange={(e) => onChange({ cpf: e.target.value })}
            className="border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            placeholder="joao@exemplo.com"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input
            placeholder="(00) 00000-0000"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          />
        </div>
      </div>
    </div>
  )
}

export function StepAnamnese({ data, onChange }: any) {
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto text-left animate-fade-in">
      <div className="space-y-2">
        <Label>Queixa Principal</Label>
        <Textarea
          placeholder="Descreva o motivo principal da consulta..."
          className="min-h-[100px] border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          value={data.queixa}
          onChange={(e) => onChange({ queixa: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Histórico Médico e Familiar</Label>
        <Textarea
          placeholder="Doenças prévias, alergias, medicações em uso, histórico familiar..."
          className="min-h-[120px] border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          value={data.historico}
          onChange={(e) => onChange({ historico: e.target.value })}
        />
      </div>
    </div>
  )
}

export function StepTCLE({ data, onChange }: any) {
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto text-left animate-fade-in">
      <div className="p-5 bg-[#1E3A8A]/5 rounded-lg text-sm text-slate-700 h-48 overflow-y-auto mb-4 border border-[#1E3A8A]/10 leading-relaxed">
        <h3 className="font-bold mb-2">Termo de Consentimento Livre e Esclarecido (TCLE)</h3>
        <p className="mb-2">
          Declaro ter sido informado(a) de forma clara e objetiva sobre os procedimentos, exames e
          tratamentos propostos durante a Consulta Premium.
        </p>
        <p className="mb-2">
          Compreendo que a abordagem terapêutica pode envolver análises quânticas (biorressonância)
          e laboratoriais, e que o sucesso do tratamento depende também da minha adesão às
          orientações prescritas.
        </p>
        <p>
          Autorizo o registro dos meus dados clínicos de forma segura e sigilosa no sistema da
          clínica, em conformidade com as leis de proteção de dados aplicáveis.
        </p>
      </div>
      <div className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-[#1E3A8A]/20 shadow-sm">
        <Checkbox
          id="tcle"
          checked={data.aceite}
          onCheckedChange={(checked) => onChange({ aceite: checked })}
          className="data-[state=checked]:bg-[#1E3A8A] data-[state=checked]:border-[#1E3A8A]"
        />
        <Label htmlFor="tcle" className="font-medium cursor-pointer">
          Li, compreendi e concordo com os termos descritos acima *
        </Label>
      </div>
    </div>
  )
}

export function StepBiorressonancia({ data, onChange }: any) {
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto text-left animate-fade-in">
      <div className="space-y-2">
        <Label>Resultados da Análise Quântica (Biorressonância)</Label>
        <Textarea
          placeholder="Registre os achados relevantes do exame de biorressonância, deficiências nutricionais, sobrecargas, etc..."
          className="min-h-[200px] border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          value={data.biorressonancia}
          onChange={(e) => onChange({ biorressonancia: e.target.value })}
        />
      </div>
    </div>
  )
}

export function StepLaboratorial({ data, onChange }: any) {
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto text-left animate-fade-in">
      <div className="space-y-2">
        <Label>Exames Laboratoriais (Solicitados / Avaliados)</Label>
        <Textarea
          placeholder="Hemograma, Glicemia, Perfil Lipídico, Hormônios, etc..."
          className="min-h-[200px] border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          value={data.laboratorial}
          onChange={(e) => onChange({ laboratorial: e.target.value })}
        />
      </div>
    </div>
  )
}

export function StepPrescricao({ data, onChange }: any) {
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto text-left animate-fade-in">
      <div className="space-y-2">
        <Label>Receituário Final (Medicamentos / Suplementos)</Label>
        <Textarea
          placeholder="Prescrição detalhada com posologia..."
          className="min-h-[150px] border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          value={data.prescricao}
          onChange={(e) => onChange({ prescricao: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Orientações Gerais ao Paciente</Label>
        <Textarea
          placeholder="Dieta, hidratação, exercícios físicos, retorno..."
          className="min-h-[100px] border-[#1E3A8A]/20 focus-visible:ring-[#B8860B]"
          value={data.orientacoes}
          onChange={(e) => onChange({ orientacoes: e.target.value })}
        />
      </div>
    </div>
  )
}
