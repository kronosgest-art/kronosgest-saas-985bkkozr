// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      abas_crm: {
        Row: {
          created_at: string
          etiqueta_id: string | null
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string
          etiqueta_id?: string | null
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string
          etiqueta_id?: string | null
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "abas_crm_etiqueta_id_fkey"
            columns: ["etiqueta_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          assinatura_paciente: string | null
          criado_em: string
          data: string
          data_assinatura: string | null
          google_event_id: string | null
          horario: string
          id: string
          observacoes: string | null
          patient_id: string
          profissional_id: string | null
          status: string | null
          tipo_consulta: string
        }
        Insert: {
          assinatura_paciente?: string | null
          criado_em?: string
          data: string
          data_assinatura?: string | null
          google_event_id?: string | null
          horario: string
          id?: string
          observacoes?: string | null
          patient_id: string
          profissional_id?: string | null
          status?: string | null
          tipo_consulta: string
        }
        Update: {
          assinatura_paciente?: string | null
          criado_em?: string
          data?: string
          data_assinatura?: string | null
          google_event_id?: string | null
          horario?: string
          id?: string
          observacoes?: string | null
          patient_id?: string
          profissional_id?: string | null
          status?: string | null
          tipo_consulta?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnese: {
        Row: {
          anamnese_id: string
          assinatura_paciente: Json | null
          atualizado_em: string
          criado_em: string
          organization_id: string | null
          patient_id: string | null
          respostas: Json
          template_id: string | null
        }
        Insert: {
          anamnese_id?: string
          assinatura_paciente?: Json | null
          atualizado_em?: string
          criado_em?: string
          organization_id?: string | null
          patient_id?: string | null
          respostas?: Json
          template_id?: string | null
        }
        Update: {
          anamnese_id?: string
          assinatura_paciente?: Json | null
          atualizado_em?: string
          criado_em?: string
          organization_id?: string | null
          patient_id?: string | null
          respostas?: Json
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamnese_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnese_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "anamnese_templates"
            referencedColumns: ["template_id"]
          },
        ]
      }
      anamnese_templates: {
        Row: {
          atualizado_em: string
          criado_em: string
          eh_padrao: boolean | null
          nome_template: string
          organization_id: string | null
          perguntas: Json
          profissional_id: string | null
          template_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          eh_padrao?: boolean | null
          nome_template: string
          organization_id?: string | null
          perguntas?: Json
          profissional_id?: string | null
          template_id?: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          eh_padrao?: boolean | null
          nome_template?: string
          organization_id?: string | null
          perguntas?: Json
          profissional_id?: string | null
          template_id?: string
        }
        Relationships: []
      }
      configuracao_ia: {
        Row: {
          created_at: string
          id: string
          profissional_id: string
          prompt_personalizado: string | null
          protocolos_selecionados: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profissional_id: string
          prompt_personalizado?: string | null
          protocolos_selecionados?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profissional_id?: string
          prompt_personalizado?: string | null
          protocolos_selecionados?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      consultas: {
        Row: {
          consultation_date: string
          consultation_type: string
          created_at: string
          data_collected: Json | null
          id: string
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          consultation_date?: string
          consultation_type: string
          created_at?: string
          data_collected?: Json | null
          id?: string
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          consultation_date?: string
          consultation_type?: string
          created_at?: string
          data_collected?: Json | null
          id?: string
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      creditos_usuario: {
        Row: {
          created_at: string | null
          id: string
          saldo_creditos: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          saldo_creditos?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          saldo_creditos?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cupons: {
        Row: {
          codigo: string
          created_at: string | null
          criado_por: string
          data_fim: string
          data_inicio: string
          desconto_fixo: number | null
          desconto_percentual: number | null
          id: string
          planos_validos: string[]
          status: string | null
          uso_atual: number | null
          uso_maximo: number
        }
        Insert: {
          codigo: string
          created_at?: string | null
          criado_por: string
          data_fim: string
          data_inicio: string
          desconto_fixo?: number | null
          desconto_percentual?: number | null
          id?: string
          planos_validos: string[]
          status?: string | null
          uso_atual?: number | null
          uso_maximo: number
        }
        Update: {
          codigo?: string
          created_at?: string | null
          criado_por?: string
          data_fim?: string
          data_inicio?: string
          desconto_fixo?: number | null
          desconto_percentual?: number | null
          id?: string
          planos_validos?: string[]
          status?: string | null
          uso_atual?: number | null
          uso_maximo?: number
        }
        Relationships: []
      }
      despesas: {
        Row: {
          banco_retirada: string | null
          categoria: string
          created_at: string
          data_despesa: string
          descricao: string
          forma_pagamento: string
          frequencia_recorrencia: string | null
          id: string
          profissional_id: string | null
          recorrente: boolean
          status: string
          tipo_conta: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          banco_retirada?: string | null
          categoria: string
          created_at?: string
          data_despesa: string
          descricao: string
          forma_pagamento?: string
          frequencia_recorrencia?: string | null
          id?: string
          profissional_id?: string | null
          recorrente?: boolean
          status?: string
          tipo_conta?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          banco_retirada?: string | null
          categoria?: string
          created_at?: string
          data_despesa?: string
          descricao?: string
          forma_pagamento?: string
          frequencia_recorrencia?: string | null
          id?: string
          profissional_id?: string | null
          recorrente?: boolean
          status?: string
          tipo_conta?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      etiquetas: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          cor: string
          created_at?: string
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      exames: {
        Row: {
          arquivo_pdf_url: string | null
          created_at: string
          id: string
          interpretacao_ia: string | null
          observacoes_profissional: string | null
          organization_id: string | null
          patient_id: string
          resultado_json: Json | null
          status: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          arquivo_pdf_url?: string | null
          created_at?: string
          id?: string
          interpretacao_ia?: string | null
          observacoes_profissional?: string | null
          organization_id?: string | null
          patient_id: string
          resultado_json?: Json | null
          status?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          arquivo_pdf_url?: string | null
          created_at?: string
          id?: string
          interpretacao_ia?: string | null
          observacoes_profissional?: string | null
          organization_id?: string | null
          patient_id?: string
          resultado_json?: Json | null
          status?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exames_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacoes: {
        Row: {
          comissao_20_porcento: number
          created_at: string | null
          data_compra: string | null
          data_indicacao: string | null
          data_pagamento: string | null
          id: string
          indicado_id: string
          indicador_id: string
          plano_comprado: string
          status: string | null
          valor_venda: number
        }
        Insert: {
          comissao_20_porcento: number
          created_at?: string | null
          data_compra?: string | null
          data_indicacao?: string | null
          data_pagamento?: string | null
          id?: string
          indicado_id: string
          indicador_id: string
          plano_comprado: string
          status?: string | null
          valor_venda: number
        }
        Update: {
          comissao_20_porcento?: number
          created_at?: string | null
          data_compra?: string | null
          data_indicacao?: string | null
          data_pagamento?: string | null
          id?: string
          indicado_id?: string
          indicador_id?: string
          plano_comprado?: string
          status?: string | null
          valor_venda?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          etiqueta_id: string | null
          id: string
          msg: string | null
          name: string
          phone: string | null
          source: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          etiqueta_id?: string | null
          id?: string
          msg?: string | null
          name: string
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          etiqueta_id?: string | null
          id?: string
          msg?: string | null
          name?: string
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_etiqueta_id_fkey"
            columns: ["etiqueta_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_whatsapp: {
        Row: {
          created_at: string
          id: string
          mensagem: string
          numero_whatsapp: string
          processada: boolean | null
          resposta_ia: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem: string
          numero_whatsapp: string
          processada?: boolean | null
          resposta_ia?: string | null
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          mensagem?: string
          numero_whatsapp?: string
          processada?: boolean | null
          resposta_ia?: string | null
          tipo?: string
        }
        Relationships: []
      }
      movimentacoes_credito: {
        Row: {
          created_at: string | null
          data_movimentacao: string | null
          descricao: string | null
          id: string
          origem: string
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_movimentacao?: string | null
          descricao?: string | null
          id?: string
          origem: string
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string | null
          data_movimentacao?: string | null
          descricao?: string | null
          id?: string
          origem?: string
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      organizations: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          horario_funcionamento: string | null
          id: string
          logo_url: string | null
          nome: string
          owner_id: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          horario_funcionamento?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          owner_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          horario_funcionamento?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          owner_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          deleted_at: string | null
          email: string | null
          endereco: string | null
          id: string
          last_consultation: string | null
          nome_completo: string
          observacoes: string | null
          organization_id: string | null
          profissao: string | null
          sexo: string | null
          status: string | null
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          deleted_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          last_consultation?: string | null
          nome_completo: string
          observacoes?: string | null
          organization_id?: string | null
          profissao?: string | null
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          deleted_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          last_consultation?: string | null
          nome_completo?: string
          observacoes?: string | null
          organization_id?: string | null
          profissao?: string | null
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pacientes_acesso: {
        Row: {
          ativo: boolean
          cpf: string
          created_at: string
          criado_por: string
          email: string
          id: string
          paciente_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cpf: string
          created_at?: string
          criado_por: string
          email: string
          id?: string
          paciente_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cpf?: string
          created_at?: string
          criado_por?: string
          email?: string
          id?: string
          paciente_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_acesso_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string
          cupom_aplicado: string | null
          data_pagamento: string | null
          id: string
          invoice_slug: string | null
          metodo_pagamento: string
          order_nsu: string
          plano: string
          status: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          cupom_aplicado?: string | null
          data_pagamento?: string | null
          id?: string
          invoice_slug?: string | null
          metodo_pagamento: string
          order_nsu: string
          plano: string
          status?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          cupom_aplicado?: string | null
          data_pagamento?: string | null
          id?: string
          invoice_slug?: string | null
          metodo_pagamento?: string
          order_nsu?: string
          plano?: string
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      prescricoes: {
        Row: {
          anamnese_id: string | null
          arquivo_pdf_url: string | null
          conteudo_json: Json | null
          created_at: string
          exames_ids: string[] | null
          id: string
          patient_id: string
          updated_at: string
        }
        Insert: {
          anamnese_id?: string | null
          arquivo_pdf_url?: string | null
          conteudo_json?: Json | null
          created_at?: string
          exames_ids?: string[] | null
          id?: string
          patient_id: string
          updated_at?: string
        }
        Update: {
          anamnese_id?: string | null
          arquivo_pdf_url?: string | null
          conteudo_json?: Json | null
          created_at?: string
          exames_ids?: string[] | null
          id?: string
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescricoes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          especialidade: string | null
          foto_url: string | null
          google_calendar_id: string | null
          id: string
          nome_completo: string
          numero_registro: string | null
          organization_id: string | null
          pode_ver_financeiro_clinica: boolean | null
          status: boolean | null
          telefone: string | null
          tipo_profissional: string | null
          tipo_registro: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          especialidade?: string | null
          foto_url?: string | null
          google_calendar_id?: string | null
          id?: string
          nome_completo: string
          numero_registro?: string | null
          organization_id?: string | null
          pode_ver_financeiro_clinica?: boolean | null
          status?: boolean | null
          telefone?: string | null
          tipo_profissional?: string | null
          tipo_registro?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          especialidade?: string | null
          foto_url?: string | null
          google_calendar_id?: string | null
          id?: string
          nome_completo?: string
          numero_registro?: string | null
          organization_id?: string | null
          pode_ver_financeiro_clinica?: boolean | null
          status?: boolean | null
          telefone?: string | null
          tipo_profissional?: string | null
          tipo_registro?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais_clinica: {
        Row: {
          clinica_id: string
          created_at: string | null
          crm: string | null
          data_criacao: string | null
          email: string
          id: string
          limite_ia_mensal: number | null
          nome: string
          status: string | null
          tokens_usados_mes: number | null
        }
        Insert: {
          clinica_id: string
          created_at?: string | null
          crm?: string | null
          data_criacao?: string | null
          email: string
          id?: string
          limite_ia_mensal?: number | null
          nome: string
          status?: string | null
          tokens_usados_mes?: number | null
        }
        Update: {
          clinica_id?: string
          created_at?: string | null
          crm?: string | null
          data_criacao?: string | null
          email?: string
          id?: string
          limite_ia_mensal?: number | null
          nome?: string
          status?: string | null
          tokens_usados_mes?: number | null
        }
        Relationships: []
      }
      protocolos: {
        Row: {
          apenas_pacote_fechado: boolean | null
          beneficios_esperados: string | null
          contraindicacoes: string | null
          created_at: string
          criado_por: string | null
          desconto_progressivo: string | null
          descricao: string | null
          duracao: string | null
          duracao_sessao: string | null
          frequencia: string | null
          id: string
          indicacao: string | null
          is_padrao: boolean | null
          nome: string
          nome_protocolo: string | null
          numero_sessoes: number | null
          suplementos: string | null
          tcle_outro: string | null
          tipo: string | null
          tipo_aplicacao: string | null
          tipo_tcle: string | null
          updated_at: string
          user_id: string | null
          valor_sessao_avulsa: number | null
          valor_total: number | null
          vezes_prescrito: number | null
        }
        Insert: {
          apenas_pacote_fechado?: boolean | null
          beneficios_esperados?: string | null
          contraindicacoes?: string | null
          created_at?: string
          criado_por?: string | null
          desconto_progressivo?: string | null
          descricao?: string | null
          duracao?: string | null
          duracao_sessao?: string | null
          frequencia?: string | null
          id?: string
          indicacao?: string | null
          is_padrao?: boolean | null
          nome: string
          nome_protocolo?: string | null
          numero_sessoes?: number | null
          suplementos?: string | null
          tcle_outro?: string | null
          tipo?: string | null
          tipo_aplicacao?: string | null
          tipo_tcle?: string | null
          updated_at?: string
          user_id?: string | null
          valor_sessao_avulsa?: number | null
          valor_total?: number | null
          vezes_prescrito?: number | null
        }
        Update: {
          apenas_pacote_fechado?: boolean | null
          beneficios_esperados?: string | null
          contraindicacoes?: string | null
          created_at?: string
          criado_por?: string | null
          desconto_progressivo?: string | null
          descricao?: string | null
          duracao?: string | null
          duracao_sessao?: string | null
          frequencia?: string | null
          id?: string
          indicacao?: string | null
          is_padrao?: boolean | null
          nome?: string
          nome_protocolo?: string | null
          numero_sessoes?: number | null
          suplementos?: string | null
          tcle_outro?: string | null
          tipo?: string | null
          tipo_aplicacao?: string | null
          tipo_tcle?: string | null
          updated_at?: string
          user_id?: string | null
          valor_sessao_avulsa?: number | null
          valor_total?: number | null
          vezes_prescrito?: number | null
        }
        Relationships: []
      }
      receitas: {
        Row: {
          banco_recebimento: string | null
          created_at: string
          data_receita: string
          descricao_customizada: string | null
          forma_pagamento: string
          frequencia_recorrencia: string | null
          id: string
          profissional_id: string | null
          protocolo_id: string | null
          recorrente: boolean
          status: string
          tipo_receita: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          banco_recebimento?: string | null
          created_at?: string
          data_receita: string
          descricao_customizada?: string | null
          forma_pagamento: string
          frequencia_recorrencia?: string | null
          id?: string
          profissional_id?: string | null
          protocolo_id?: string | null
          recorrente?: boolean
          status?: string
          tipo_receita: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          banco_recebimento?: string | null
          created_at?: string
          data_receita?: string
          descricao_customizada?: string | null
          forma_pagamento?: string
          frequencia_recorrencia?: string | null
          id?: string
          profissional_id?: string | null
          protocolo_id?: string | null
          recorrente?: boolean
          status?: string
          tipo_receita?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "receitas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string
          id: string
          mensagem: string
          profissional_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem: string
          profissional_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mensagem?: string
          profissional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      tcle_assinado: {
        Row: {
          assinatura: string
          created_at: string
          data_assinatura: string
          id: string
          patient_id: string
          tipo_assinatura: string
        }
        Insert: {
          assinatura: string
          created_at?: string
          data_assinatura?: string
          id?: string
          patient_id: string
          tipo_assinatura: string
        }
        Update: {
          assinatura?: string
          created_at?: string
          data_assinatura?: string
          id?: string
          patient_id?: string
          tipo_assinatura?: string
        }
        Relationships: [
          {
            foreignKeyName: "tcle_assinado_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_comprados: {
        Row: {
          created_at: string | null
          data_compra: string | null
          expira_em: string
          id: string
          metodo_pagamento: string | null
          preco_pago: number
          quantidade: number
          status: string | null
          tokens_restantes: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_compra?: string | null
          expira_em: string
          id?: string
          metodo_pagamento?: string | null
          preco_pago: number
          quantidade: number
          status?: string | null
          tokens_restantes: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_compra?: string | null
          expira_em?: string
          id?: string
          metodo_pagamento?: string | null
          preco_pago?: number
          quantidade?: number
          status?: string | null
          tokens_restantes?: number
          user_id?: string
        }
        Relationships: []
      }
      tokens_inclusos: {
        Row: {
          created_at: string | null
          id: string
          mes_ano: string
          plano: string
          reset_em: string
          tokens_prescricoes_limite: number
          tokens_prescricoes_usado: number | null
          tokens_whatsapp_limite: number
          tokens_whatsapp_usado: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mes_ano: string
          plano: string
          reset_em: string
          tokens_prescricoes_limite: number
          tokens_prescricoes_usado?: number | null
          tokens_whatsapp_limite: number
          tokens_whatsapp_usado?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mes_ano?: string
          plano?: string
          reset_em?: string
          tokens_prescricoes_limite?: number
          tokens_prescricoes_usado?: number | null
          tokens_whatsapp_limite?: number
          tokens_whatsapp_usado?: number | null
          user_id?: string
        }
        Relationships: []
      }
      uso_tokens: {
        Row: {
          created_at: string | null
          data_uso: string | null
          descricao: string | null
          id: string
          origem: string
          tipo: string
          tokens_consumidos: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_uso?: string | null
          descricao?: string | null
          id?: string
          origem: string
          tipo: string
          tokens_consumidos: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_uso?: string | null
          descricao?: string | null
          id?: string
          origem?: string
          tipo?: string
          tokens_consumidos?: number
          user_id?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          created_at: string
          data_venda: string
          id: string
          patient_id: string | null
          profissional_id: string | null
          protocolo_id: string | null
          status: string
          tipo: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          data_venda?: string
          id?: string
          patient_id?: string | null
          profissional_id?: string | null
          protocolo_id?: string | null
          status?: string
          tipo?: string | null
          valor: number
        }
        Update: {
          created_at?: string
          data_venda?: string
          id?: string
          patient_id?: string | null
          profissional_id?: string | null
          protocolo_id?: string | null
          status?: string
          tipo?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_payment_status: {
        Args: { p_payment_id: string; p_status: string }
        Returns: undefined
      }
      admin_update_subscription: {
        Args: {
          p_free_access_end_date?: string
          p_free_access_start_date?: string
          p_status: string
          p_subscription_id: string
        }
        Returns: undefined
      }
      admin_update_subscription_full: {
        Args: {
          p_add_months?: number
          p_blocked_reason?: string
          p_plan?: string
          p_status?: string
          p_subscription_id: string
        }
        Returns: undefined
      }
      get_admin_billing: {
        Args: never
        Returns: {
          amount: number
          clinica_nome: string
          created_at: string
          email: string
          method: string
          payment_id: string
          plan: string
          status: string
        }[]
      }
      get_admin_credit_purchases: {
        Args: never
        Returns: {
          admin_email: string
          clinica_nome: string
          created_at: string
          credits_amount: number
          id: string
          package_name: string
          payment_method: string
          price: number
          status: string
        }[]
      }
      get_admin_subscriptions: {
        Args: never
        Returns: {
          email: string
          free_access_end_date: string
          nome: string
          status: string
          subscription_id: string
          trial_end_date: string
          user_id: string
        }[]
      }
      get_all_subscribers: {
        Args: never
        Returns: {
          clinica_nome: string
          created_at: string
          email: string
          free_access_end_date: string
          plan: string
          status: string
          subscription_id: string
          trial_end_date: string
          user_id: string
        }[]
      }
      reset_tokens_mensais: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: abas_crm
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   nome: text (not null)
//   etiqueta_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: admin_audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   admin_id: uuid (nullable)
//   action: text (not null)
//   details: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: agendamentos
//   id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (not null)
//   data: date (not null)
//   horario: time without time zone (not null)
//   tipo_consulta: text (not null)
//   observacoes: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   profissional_id: uuid (nullable)
//   status: text (nullable, default: 'Agendado'::text)
//   google_event_id: text (nullable)
//   assinatura_paciente: text (nullable)
//   data_assinatura: timestamp with time zone (nullable)
// Table: anamnese
//   anamnese_id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (nullable)
//   organization_id: uuid (nullable)
//   template_id: uuid (nullable)
//   respostas: jsonb (not null, default: '[]'::jsonb)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   assinatura_paciente: jsonb (nullable)
// Table: anamnese_templates
//   template_id: uuid (not null, default: gen_random_uuid())
//   organization_id: uuid (nullable)
//   profissional_id: uuid (nullable)
//   nome_template: text (not null)
//   eh_padrao: boolean (nullable, default: false)
//   perguntas: jsonb (not null, default: '[]'::jsonb)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
// Table: configuracao_ia
//   id: uuid (not null, default: gen_random_uuid())
//   profissional_id: uuid (not null)
//   prompt_personalizado: text (nullable)
//   protocolos_selecionados: jsonb (nullable, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: consultas
//   id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (not null)
//   consultation_type: text (not null)
//   consultation_date: timestamp with time zone (not null, default: now())
//   status: text (not null, default: 'Realizada'::text)
//   data_collected: jsonb (nullable, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: creditos_usuario
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   saldo_creditos: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: cupons
//   id: uuid (not null, default: gen_random_uuid())
//   codigo: text (not null)
//   desconto_percentual: integer (nullable)
//   desconto_fixo: numeric (nullable)
//   data_inicio: timestamp with time zone (not null)
//   data_fim: timestamp with time zone (not null)
//   uso_maximo: integer (not null)
//   uso_atual: integer (nullable, default: 0)
//   planos_validos: _text (not null)
//   status: text (nullable, default: 'ativo'::text)
//   criado_por: uuid (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: despesas
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   categoria: text (not null)
//   descricao: text (not null)
//   valor: numeric (not null)
//   data_despesa: date (not null)
//   recorrente: boolean (not null, default: false)
//   frequencia_recorrencia: text (nullable)
//   status: text (not null, default: 'pendente'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   forma_pagamento: text (not null, default: 'Pix'::text)
//   tipo_conta: text (not null, default: 'Conta Empresa'::text)
//   banco_retirada: text (nullable)
//   profissional_id: uuid (nullable)
// Table: etiquetas
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   nome: text (not null)
//   cor: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: exames
//   id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (not null)
//   tipo: text (not null)
//   resultado_json: jsonb (nullable)
//   arquivo_pdf_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   organization_id: uuid (nullable)
//   interpretacao_ia: text (nullable)
//   status: text (nullable, default: 'pendente'::text)
//   observacoes_profissional: text (nullable)
// Table: indicacoes
//   id: uuid (not null, default: gen_random_uuid())
//   indicador_id: uuid (not null)
//   indicado_id: uuid (not null)
//   plano_comprado: text (not null)
//   valor_venda: numeric (not null)
//   comissao_20_porcento: numeric (not null)
//   status: text (nullable, default: 'pendente'::text)
//   data_indicacao: timestamp with time zone (nullable, default: now())
//   data_compra: timestamp with time zone (nullable)
//   data_pagamento: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   name: text (not null)
//   status: text (not null, default: 'novo'::text)
//   msg: text (nullable)
//   source: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   phone: text (nullable)
//   email: text (nullable)
//   etiqueta_id: uuid (nullable)
// Table: mensagens_whatsapp
//   id: uuid (not null, default: gen_random_uuid())
//   numero_whatsapp: text (not null)
//   mensagem: text (not null)
//   tipo: text (not null)
//   processada: boolean (nullable, default: false)
//   resposta_ia: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: movimentacoes_credito
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   tipo: text (not null)
//   valor: numeric (not null)
//   origem: text (not null)
//   descricao: text (nullable)
//   data_movimentacao: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (nullable, default: now())
// Table: organizations
//   id: uuid (not null, default: gen_random_uuid())
//   owner_id: uuid (nullable)
//   nome: text (not null)
//   cnpj: text (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   endereco: text (nullable)
//   horario_funcionamento: text (nullable)
//   logo_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: pacientes
//   id: uuid (not null, default: gen_random_uuid())
//   organization_id: uuid (nullable)
//   user_id: uuid (nullable)
//   nome_completo: text (not null)
//   cpf: text (nullable)
//   email: text (nullable)
//   telefone: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   status: text (nullable, default: 'Ativo'::text)
//   last_consultation: timestamp with time zone (nullable)
//   data_nascimento: date (nullable)
//   sexo: text (nullable)
//   endereco: text (nullable)
//   profissao: text (nullable)
//   observacoes: text (nullable)
//   deleted_at: timestamp with time zone (nullable)
// Table: pacientes_acesso
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   email: text (not null)
//   cpf: text (not null)
//   ativo: boolean (not null, default: true)
//   criado_por: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: pagamentos
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   plano: text (not null)
//   valor: numeric (not null)
//   order_nsu: text (not null)
//   status: text (not null, default: 'pendente'::text)
//   metodo_pagamento: text (not null)
//   cupom_aplicado: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   data_pagamento: timestamp with time zone (nullable)
//   invoice_slug: text (nullable)
// Table: prescricoes
//   id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (not null)
//   anamnese_id: text (nullable)
//   exames_ids: _uuid (nullable)
//   conteudo_json: jsonb (nullable)
//   arquivo_pdf_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: profissionais
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   organization_id: uuid (nullable)
//   nome_completo: text (not null)
//   cpf: text (nullable)
//   tipo_registro: text (nullable)
//   numero_registro: text (nullable)
//   especialidade: text (nullable)
//   foto_url: text (nullable)
//   status: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   google_calendar_id: text (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   tipo_profissional: text (nullable, default: 'proprietario'::text)
//   pode_ver_financeiro_clinica: boolean (nullable, default: false)
// Table: profissionais_clinica
//   id: uuid (not null, default: gen_random_uuid())
//   clinica_id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   crm: text (nullable)
//   limite_ia_mensal: integer (nullable, default: 200)
//   tokens_usados_mes: integer (nullable, default: 0)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   status: text (nullable, default: 'ativo'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: protocolos
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   nome: text (not null)
//   tipo: text (nullable)
//   duracao: text (nullable)
//   descricao: text (nullable)
//   suplementos: text (nullable)
//   contraindicacoes: text (nullable)
//   is_padrao: boolean (nullable, default: false)
//   vezes_prescrito: integer (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   nome_protocolo: text (nullable)
//   indicacao: text (nullable)
//   numero_sessoes: integer (nullable)
//   tipo_aplicacao: text (nullable)
//   frequencia: text (nullable)
//   duracao_sessao: text (nullable)
//   valor_total: numeric (nullable)
//   tipo_tcle: text (nullable)
//   tcle_outro: text (nullable)
//   beneficios_esperados: text (nullable)
//   apenas_pacote_fechado: boolean (nullable, default: true)
//   criado_por: uuid (nullable)
//   valor_sessao_avulsa: numeric (nullable)
//   desconto_progressivo: text (nullable)
// Table: receitas
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   tipo_receita: text (not null)
//   protocolo_id: uuid (nullable)
//   descricao_customizada: text (nullable)
//   valor: numeric (not null)
//   data_receita: date (not null)
//   forma_pagamento: text (not null)
//   recorrente: boolean (not null, default: false)
//   frequencia_recorrencia: text (nullable)
//   status: text (not null, default: 'pendente'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   banco_recebimento: text (nullable)
//   profissional_id: uuid (nullable)
// Table: sync_logs
//   id: uuid (not null, default: gen_random_uuid())
//   profissional_id: uuid (nullable)
//   mensagem: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: tcle_assinado
//   id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (not null)
//   assinatura: text (not null)
//   data_assinatura: timestamp with time zone (not null, default: now())
//   tipo_assinatura: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: tokens_comprados
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   quantidade: integer (not null)
//   preco_pago: numeric (not null)
//   data_compra: timestamp with time zone (nullable, default: now())
//   tokens_restantes: integer (not null)
//   status: text (nullable, default: 'ativo'::text)
//   expira_em: timestamp with time zone (not null)
//   created_at: timestamp with time zone (nullable, default: now())
//   metodo_pagamento: text (nullable)
// Table: tokens_inclusos
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   plano: text (not null)
//   tokens_whatsapp_limite: integer (not null)
//   tokens_prescricoes_limite: integer (not null)
//   tokens_whatsapp_usado: integer (nullable, default: 0)
//   tokens_prescricoes_usado: integer (nullable, default: 0)
//   mes_ano: text (not null)
//   reset_em: timestamp with time zone (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: uso_tokens
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   tipo: text (not null)
//   tokens_consumidos: integer (not null)
//   origem: text (not null)
//   descricao: text (nullable)
//   data_uso: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (nullable, default: now())
// Table: vendas
//   id: uuid (not null, default: gen_random_uuid())
//   protocolo_id: uuid (nullable)
//   patient_id: uuid (nullable)
//   profissional_id: uuid (nullable)
//   valor: numeric (not null)
//   data_venda: timestamp with time zone (not null, default: now())
//   status: text (not null, default: 'pendente'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   tipo: text (nullable, default: 'entrada'::text)

// --- CONSTRAINTS ---
// Table: abas_crm
//   FOREIGN KEY abas_crm_etiqueta_id_fkey: FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE SET NULL
//   PRIMARY KEY abas_crm_pkey: PRIMARY KEY (id)
//   FOREIGN KEY abas_crm_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: admin_audit_logs
//   FOREIGN KEY admin_audit_logs_admin_id_fkey: FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL
//   PRIMARY KEY admin_audit_logs_pkey: PRIMARY KEY (id)
// Table: agendamentos
//   FOREIGN KEY agendamentos_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY agendamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY agendamentos_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
// Table: anamnese
//   FOREIGN KEY anamnese_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY anamnese_pkey: PRIMARY KEY (anamnese_id)
//   FOREIGN KEY anamnese_template_id_fkey: FOREIGN KEY (template_id) REFERENCES anamnese_templates(template_id) ON DELETE SET NULL
// Table: anamnese_templates
//   PRIMARY KEY anamnese_templates_pkey: PRIMARY KEY (template_id)
//   FOREIGN KEY anamnese_templates_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: configuracao_ia
//   PRIMARY KEY configuracao_ia_pkey: PRIMARY KEY (id)
//   FOREIGN KEY configuracao_ia_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: consultas
//   FOREIGN KEY consultas_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY consultas_pkey: PRIMARY KEY (id)
// Table: creditos_usuario
//   PRIMARY KEY creditos_usuario_pkey: PRIMARY KEY (id)
//   FOREIGN KEY creditos_usuario_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE creditos_usuario_user_id_key: UNIQUE (user_id)
// Table: cupons
//   UNIQUE cupons_codigo_key: UNIQUE (codigo)
//   FOREIGN KEY cupons_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY cupons_pkey: PRIMARY KEY (id)
//   CHECK cupons_status_check: CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text])))
// Table: despesas
//   PRIMARY KEY despesas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY despesas_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
//   FOREIGN KEY despesas_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: etiquetas
//   PRIMARY KEY etiquetas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY etiquetas_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: exames
//   FOREIGN KEY exames_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY exames_pkey: PRIMARY KEY (id)
// Table: indicacoes
//   FOREIGN KEY indicacoes_indicado_id_fkey: FOREIGN KEY (indicado_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY indicacoes_indicador_id_fkey: FOREIGN KEY (indicador_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY indicacoes_pkey: PRIMARY KEY (id)
//   CHECK indicacoes_plano_comprado_check: CHECK ((plano_comprado = ANY (ARRAY['Starter'::text, 'Professional'::text, 'Enterprise'::text])))
//   CHECK indicacoes_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'pago'::text, 'cancelado'::text])))
// Table: leads
//   FOREIGN KEY leads_etiqueta_id_fkey: FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE SET NULL
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: mensagens_whatsapp
//   PRIMARY KEY mensagens_whatsapp_pkey: PRIMARY KEY (id)
// Table: movimentacoes_credito
//   CHECK movimentacoes_credito_origem_check: CHECK ((origem = ANY (ARRAY['comissao_indicacao'::text, 'compra_tokens'::text, 'reembolso'::text])))
//   PRIMARY KEY movimentacoes_credito_pkey: PRIMARY KEY (id)
//   CHECK movimentacoes_credito_tipo_check: CHECK ((tipo = ANY (ARRAY['entrada'::text, 'saida'::text])))
//   FOREIGN KEY movimentacoes_credito_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: organizations
//   FOREIGN KEY organizations_owner_id_fkey: FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY organizations_pkey: PRIMARY KEY (id)
// Table: pacientes
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pacientes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: pacientes_acesso
//   UNIQUE pacientes_acesso_cpf_key: UNIQUE (cpf)
//   FOREIGN KEY pacientes_acesso_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE pacientes_acesso_email_key: UNIQUE (email)
//   FOREIGN KEY pacientes_acesso_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY pacientes_acesso_pkey: PRIMARY KEY (id)
// Table: pagamentos
//   UNIQUE pagamentos_order_nsu_key: UNIQUE (order_nsu)
//   PRIMARY KEY pagamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pagamentos_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: prescricoes
//   FOREIGN KEY prescricoes_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY prescricoes_pkey: PRIMARY KEY (id)
// Table: profissionais
//   FOREIGN KEY profissionais_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
//   PRIMARY KEY profissionais_pkey: PRIMARY KEY (id)
//   FOREIGN KEY profissionais_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: profissionais_clinica
//   UNIQUE profissionais_clinica_clinica_id_email_key: UNIQUE (clinica_id, email)
//   FOREIGN KEY profissionais_clinica_clinica_id_fkey: FOREIGN KEY (clinica_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profissionais_clinica_pkey: PRIMARY KEY (id)
//   CHECK profissionais_clinica_status_check: CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text])))
// Table: protocolos
//   FOREIGN KEY protocolos_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY protocolos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY protocolos_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: receitas
//   PRIMARY KEY receitas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY receitas_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
//   FOREIGN KEY receitas_protocolo_id_fkey: FOREIGN KEY (protocolo_id) REFERENCES protocolos(id) ON DELETE SET NULL
//   FOREIGN KEY receitas_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: sync_logs
//   PRIMARY KEY sync_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY sync_logs_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
// Table: tcle_assinado
//   FOREIGN KEY tcle_assinado_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY tcle_assinado_pkey: PRIMARY KEY (id)
// Table: tokens_comprados
//   CHECK tokens_comprados_metodo_pagamento_check: CHECK ((metodo_pagamento = ANY (ARRAY['pix'::text, 'boleto'::text, 'cartao'::text, 'stripe'::text])))
//   PRIMARY KEY tokens_comprados_pkey: PRIMARY KEY (id)
//   CHECK tokens_comprados_status_check: CHECK ((status = ANY (ARRAY['ativo'::text, 'expirado'::text])))
//   FOREIGN KEY tokens_comprados_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: tokens_inclusos
//   PRIMARY KEY tokens_inclusos_pkey: PRIMARY KEY (id)
//   CHECK tokens_inclusos_plano_check: CHECK ((plano = ANY (ARRAY['Starter'::text, 'Professional'::text, 'Enterprise'::text])))
//   FOREIGN KEY tokens_inclusos_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE tokens_inclusos_user_id_mes_ano_key: UNIQUE (user_id, mes_ano)
// Table: uso_tokens
//   CHECK uso_tokens_origem_check: CHECK ((origem = ANY (ARRAY['inclusos'::text, 'comprados'::text])))
//   PRIMARY KEY uso_tokens_pkey: PRIMARY KEY (id)
//   CHECK uso_tokens_tipo_check: CHECK ((tipo = ANY (ARRAY['whatsapp_resposta'::text, 'prescricao'::text])))
//   FOREIGN KEY uso_tokens_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: vendas
//   FOREIGN KEY vendas_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY vendas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY vendas_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY vendas_protocolo_id_fkey: FOREIGN KEY (protocolo_id) REFERENCES protocolos(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: abas_crm
//   Policy "abas_crm_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: admin_audit_logs
//   Policy "Admin can insert audit logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Admin can read audit logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: agendamentos
//   Policy "agendamentos_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((profissional_id IN ( SELECT profissionais.id    FROM profissionais   WHERE (profissionais.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM pacientes p   WHERE ((p.id = agendamentos.patient_id) AND ((p.user_id = auth.uid()) OR (p.organization_id IN ( SELECT organizations.id            FROM organizations           WHERE (organizations.owner_id = auth.uid()))))))))
//     WITH CHECK: ((profissional_id IN ( SELECT profissionais.id    FROM profissionais   WHERE (profissionais.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM pacientes p   WHERE ((p.id = agendamentos.patient_id) AND ((p.user_id = auth.uid()) OR (p.organization_id IN ( SELECT organizations.id            FROM organizations           WHERE (organizations.owner_id = auth.uid()))))))))
//   Policy "anon_select_agendamentos" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "anon_update_agendamentos" (UPDATE, PERMISSIVE) roles={anon}
//     USING: true
// Table: anamnese
//   Policy "anamnese_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = anamnese.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = anamnese.patient_id) AND (pacientes.user_id = auth.uid()))))
//   Policy "anon_select_anamnese" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "anon_update_anamnese" (UPDATE, PERMISSIVE) roles={anon}
//     USING: true
//     WITH CHECK: true
// Table: anamnese_templates
//   Policy "Users can delete their own templates" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = profissional_id)
//   Policy "Users can insert their own templates" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = profissional_id)
//   Policy "Users can update their own templates" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = profissional_id)
//   Policy "Users can view their own templates" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = profissional_id)
//   Policy "anon_select_anamnese_templates" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
// Table: configuracao_ia
//   Policy "configuracao_ia_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (profissional_id = auth.uid())
//   Policy "configuracao_ia_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (profissional_id = auth.uid())
//   Policy "configuracao_ia_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (profissional_id = auth.uid())
//   Policy "configuracao_ia_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (profissional_id = auth.uid())
//     WITH CHECK: (profissional_id = auth.uid())
// Table: consultas
//   Policy "consultas_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = consultas.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = consultas.patient_id) AND (pacientes.user_id = auth.uid()))))
// Table: creditos_usuario
//   Policy "Usuários atualizam seus créditos" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Usuários veem seus créditos" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
// Table: cupons
//   Policy "Todos veem cupons ativos" (SELECT, PERMISSIVE) roles={public}
//     USING: ((status = 'ativo'::text) AND (data_fim > now()))
//   Policy "Você atualiza cupons" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = criado_por)
//   Policy "Você cria cupons" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = criado_por)
// Table: despesas
//   Policy "despesas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "despesas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "despesas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (profissional_id IN ( SELECT profissionais.id    FROM profissionais   WHERE (profissionais.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM (profissionais p      JOIN organizations o ON ((p.organization_id = o.id)))   WHERE ((p.id = despesas.profissional_id) AND (o.owner_id = auth.uid())))))
//   Policy "despesas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: etiquetas
//   Policy "etiquetas_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: exames
//   Policy "exames_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = exames.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = exames.patient_id) AND (pacientes.user_id = auth.uid()))))
// Table: indicacoes
//   Policy "Usuários criam indicações" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = indicador_id)
//   Policy "Usuários veem suas indicações" (SELECT, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = indicador_id) OR (auth.uid() = indicado_id))
// Table: leads
//   Policy "Users can delete their own leads" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can insert their own leads" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can update their own leads" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view their own leads" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: mensagens_whatsapp
//   Policy "authenticated_delete_mensagens_whatsapp" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_mensagens_whatsapp" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_mensagens_whatsapp" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_mensagens_whatsapp" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: movimentacoes_credito
//   Policy "Sistema registra movimentações" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Usuários veem suas movimentações" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
// Table: organizations
//   Policy "authenticated_insert_org" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_org" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_org" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: pacientes
//   Policy "anon_select_pacientes" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "pacientes_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (organization_id IN ( SELECT organizations.id    FROM organizations   WHERE (organizations.owner_id = auth.uid()))))
//     WITH CHECK: ((user_id = auth.uid()) OR (organization_id IN ( SELECT organizations.id    FROM organizations   WHERE (organizations.owner_id = auth.uid()))))
// Table: pacientes_acesso
//   Policy "anon_select_acesso" (SELECT, PERMISSIVE) roles={anon}
//     USING: (ativo = true)
//   Policy "profissional_delete_acesso" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (criado_por = auth.uid())
//   Policy "profissional_insert_acesso" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (criado_por = auth.uid())
//   Policy "profissional_select_acesso" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (criado_por = auth.uid())
//   Policy "profissional_update_acesso" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (criado_por = auth.uid())
// Table: pagamentos
//   Policy "Usuários podem inserir seus próprios pagamentos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Usuários podem ver seus próprios pagamentos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: prescricoes
//   Policy "prescricoes_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes p   WHERE ((p.id = prescricoes.patient_id) AND ((p.user_id = auth.uid()) OR (p.organization_id IN ( SELECT organizations.id            FROM organizations           WHERE (organizations.owner_id = auth.uid())))))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes p   WHERE ((p.id = prescricoes.patient_id) AND ((p.user_id = auth.uid()) OR (p.organization_id IN ( SELECT organizations.id            FROM organizations           WHERE (organizations.owner_id = auth.uid())))))))
// Table: profissionais
//   Policy "authenticated_insert_prof" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_prof" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_prof" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: profissionais_clinica
//   Policy "Clínica atualiza profissionais" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = clinica_id)
//   Policy "Clínica cria profissionais" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = clinica_id)
//   Policy "Clínica vê seus profissionais" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = clinica_id)
// Table: protocolos
//   Policy "protocolos_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (criado_por = auth.uid()) OR (is_padrao = true))
//     WITH CHECK: ((user_id = auth.uid()) OR (criado_por = auth.uid()) OR (is_padrao = true))
// Table: receitas
//   Policy "receitas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "receitas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "receitas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (profissional_id IN ( SELECT profissionais.id    FROM profissionais   WHERE (profissionais.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM (profissionais p      JOIN organizations o ON ((p.organization_id = o.id)))   WHERE ((p.id = receitas.profissional_id) AND (o.owner_id = auth.uid())))))
//   Policy "receitas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: sync_logs
//   Policy "sync_logs_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "sync_logs_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profissionais   WHERE ((profissionais.id = sync_logs.profissional_id) AND (profissionais.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profissionais   WHERE ((profissionais.id = sync_logs.profissional_id) AND (profissionais.user_id = auth.uid()))))
// Table: tcle_assinado
//   Policy "tcle_assinado_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = tcle_assinado.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = tcle_assinado.patient_id) AND (pacientes.user_id = auth.uid()))))
// Table: tokens_comprados
//   Policy "Usuários atualizam seus tokens" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Usuários compram tokens" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Usuários veem seus próprios tokens comprados" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
// Table: tokens_inclusos
//   Policy "Usuários atualizam seus próprios limites" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Usuários criam seus próprios limites" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Usuários veem seus próprios limites" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
// Table: uso_tokens
//   Policy "Sistema registra uso" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Usuários veem seu próprio uso" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
// Table: vendas
//   Policy "vendas_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((profissional_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = vendas.patient_id) AND (pacientes.user_id = auth.uid())))))
//     WITH CHECK: ((profissional_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = vendas.patient_id) AND (pacientes.user_id = auth.uid())))))

// --- DATABASE FUNCTIONS ---
// FUNCTION admin_update_payment_status(uuid, text)
//   CREATE OR REPLACE FUNCTION public.admin_update_payment_status(p_payment_id uuid, p_status text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     UPDATE public.payments SET status = p_status WHERE id = p_payment_id;
//   END;
//   $function$
//   
// FUNCTION admin_update_subscription(uuid, text, timestamp with time zone, timestamp with time zone)
//   CREATE OR REPLACE FUNCTION public.admin_update_subscription(p_subscription_id uuid, p_status text, p_free_access_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_free_access_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     UPDATE public.subscriptions
//     SET 
//       status = p_status,
//       free_access_start_date = COALESCE(p_free_access_start_date, free_access_start_date),
//       free_access_end_date = COALESCE(p_free_access_end_date, free_access_end_date),
//       updated_at = NOW()
//     WHERE id = p_subscription_id;
//   END;
//   $function$
//   
// FUNCTION admin_update_subscription_full(uuid, text, text, text, integer)
//   CREATE OR REPLACE FUNCTION public.admin_update_subscription_full(p_subscription_id uuid, p_status text DEFAULT NULL::text, p_plan text DEFAULT NULL::text, p_blocked_reason text DEFAULT NULL::text, p_add_months integer DEFAULT 0)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF p_status IS NOT NULL THEN
//       UPDATE public.subscriptions SET status = p_status WHERE id = p_subscription_id;
//     END IF;
//     
//     IF p_plan IS NOT NULL THEN
//       UPDATE public.subscriptions SET plan = p_plan WHERE id = p_subscription_id;
//     END IF;
//   
//     IF p_blocked_reason IS NOT NULL THEN
//       UPDATE public.subscriptions SET blocked_reason = p_blocked_reason WHERE id = p_subscription_id;
//     END IF;
//   
//     IF p_add_months > 0 THEN
//       UPDATE public.subscriptions 
//       SET 
//         free_access_end_date = COALESCE(free_access_end_date, trial_end_date, NOW()) + (p_add_months || ' months')::interval,
//         status = CASE WHEN status IN ('blocked', 'suspended') THEN 'free_access' ELSE status END
//       WHERE id = p_subscription_id;
//     END IF;
//   END;
//   $function$
//   
// FUNCTION get_admin_billing()
//   CREATE OR REPLACE FUNCTION public.get_admin_billing()
//    RETURNS TABLE(payment_id uuid, created_at timestamp with time zone, clinica_nome text, email text, plan text, amount numeric, status text, method text)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN QUERY
//     SELECT 
//       p.id AS payment_id,
//       p.created_at,
//       COALESCE(o.nome, prof.nome_completo, 'Desconhecida') AS clinica_nome,
//       u.email::TEXT AS email,
//       COALESCE(s.plan, 'Básico') AS plan,
//       p.amount,
//       p.status,
//       p.method
//     FROM public.payments p
//     LEFT JOIN public.subscriptions s ON p.subscription_id = s.id OR p.user_id = s.user_id
//     JOIN auth.users u ON p.user_id = u.id
//     LEFT JOIN public.profissionais prof ON prof.user_id = p.user_id
//     LEFT JOIN public.organizations o ON prof.organization_id = o.id OR o.owner_id = u.id
//     ORDER BY p.created_at DESC;
//   END;
//   $function$
//   
// FUNCTION get_admin_credit_purchases()
//   CREATE OR REPLACE FUNCTION public.get_admin_credit_purchases()
//    RETURNS TABLE(id uuid, created_at timestamp with time zone, clinica_nome text, admin_email text, package_name text, credits_amount integer, price numeric, status text, payment_method text)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN QUERY
//     SELECT
//       cp.id,
//       cp.created_at,
//       COALESCE(o.nome, 'Desconhecida') AS clinica_nome,
//       u.email::TEXT AS admin_email,
//       cp.package_name,
//       cp.credits_amount,
//       cp.price,
//       cp.status,
//       cp.payment_method
//     FROM public.credit_purchases cp
//     JOIN auth.users u ON cp.user_id = u.id
//     LEFT JOIN public.organizations o ON cp.organization_id = o.id
//     ORDER BY cp.created_at DESC;
//   END;
//   $function$
//   
// FUNCTION get_admin_subscriptions()
//   CREATE OR REPLACE FUNCTION public.get_admin_subscriptions()
//    RETURNS TABLE(subscription_id uuid, user_id uuid, nome text, email text, status text, trial_end_date timestamp with time zone, free_access_end_date timestamp with time zone)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN QUERY
//     SELECT 
//       s.id AS subscription_id,
//       s.user_id,
//       COALESCE(p.nome_completo, 'Desconhecido') AS nome,
//       u.email::TEXT AS email,
//       s.status,
//       s.trial_end_date,
//       s.free_access_end_date
//     FROM public.subscriptions s
//     JOIN auth.users u ON s.user_id = u.id
//     LEFT JOIN public.profissionais p ON p.user_id = s.user_id
//     WHERE s.status IN ('trial', 'blocked', 'suspended', 'free_access');
//   END;
//   $function$
//   
// FUNCTION get_all_subscribers()
//   CREATE OR REPLACE FUNCTION public.get_all_subscribers()
//    RETURNS TABLE(subscription_id uuid, user_id uuid, clinica_nome text, email text, plan text, status text, created_at timestamp with time zone, trial_end_date timestamp with time zone, free_access_end_date timestamp with time zone)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN QUERY
//     SELECT DISTINCT ON (s.id)
//       s.id AS subscription_id,
//       s.user_id,
//       COALESCE(o.nome, p.nome_completo, 'Desconhecida') AS clinica_nome,
//       u.email::TEXT AS email,
//       COALESCE(s.plan, 'Básico') AS plan,
//       s.status,
//       s.created_at,
//       s.trial_end_date,
//       s.free_access_end_date
//     FROM public.subscriptions s
//     JOIN auth.users u ON s.user_id = u.id
//     LEFT JOIN public.profissionais p ON p.user_id = s.user_id
//     LEFT JOIN public.organizations o ON p.organization_id = o.id OR o.owner_id = u.id;
//   END;
//   $function$
//   
// FUNCTION handle_new_profissional()
//   CREATE OR REPLACE FUNCTION public.handle_new_profissional()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NOT EXISTS (SELECT 1 FROM public.profissionais WHERE user_id = NEW.id) THEN
//       INSERT INTO public.profissionais (user_id, nome_completo)
//       VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Profissional'));
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_profissional_template()
//   CREATE OR REPLACE FUNCTION public.handle_new_profissional_template()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.anamnese_templates (profissional_id, nome_template, eh_padrao, perguntas)
//     VALUES (
//       NEW.id,
//       'Anamnese Bio - Padrão',
//       true,
//       '[
//         {"id": "sec_1", "tipo": "section", "titulo": "I. DADOS PESSOAIS E ANTROPOMÉTRICOS"},
//         {"id": "dp_nome", "tipo": "text", "titulo": "Nome Completo", "obrigatoria": true},
//         {"id": "dp_nasc", "tipo": "date", "titulo": "Data de Nascimento"},
//         {"id": "dp_idade", "tipo": "number", "titulo": "Idade"},
//         {"id": "dp_sexo", "tipo": "radio", "titulo": "Sexo", "opcoes": ["Feminino", "Masculino"]},
//         {"id": "dp_prof", "tipo": "text", "titulo": "Profissão"},
//         {"id": "dp_email", "tipo": "email", "titulo": "E-mail"},
//         {"id": "dp_tel", "tipo": "tel", "titulo": "Telefone"},
//         {"id": "dp_alt", "tipo": "number", "titulo": "Altura (cm)"},
//         {"id": "dp_peso", "tipo": "number", "titulo": "Peso (kg)"},
//         {"id": "dp_imc", "tipo": "number", "titulo": "IMC (Calculado via sistema/manual)"},
//         {"id": "dp_cint", "tipo": "number", "titulo": "Circunferência da Cintura (cm)"},
//         {"id": "dp_quad", "tipo": "number", "titulo": "Circunferência do Quadril (cm)"},
//         {"id": "dp_rcq", "tipo": "number", "titulo": "Razão Cintura/Quadril (Calculado)"},
//         {"id": "sec_2", "tipo": "section", "titulo": "II. QUEIXA PRINCIPAL E EXPECTATIVAS"},
//         {"id": "qp_motivo", "tipo": "textarea", "titulo": "Qual o principal motivo da sua consulta hoje?"},
//         {"id": "qp_obj", "tipo": "textarea", "titulo": "Quais são seus objetivos com este tratamento?"},
//         {"id": "sec_3", "tipo": "section", "titulo": "III. HISTÓRICO DE SAÚDE E FAMILIAR"},
//         {"id": "hs_doencas", "tipo": "checkbox", "titulo": "Doenças diagnosticadas", "opcoes": ["Hipertensão Arterial", "Diabetes Mellitus", "Dislipidemias", "Doenças Cardíacas", "Doenças Tireoidianas", "Doenças Renais", "Doenças Hepáticas", "Doenças Gastrointestinais", "Alergias ou Intolerâncias", "Doenças Autoimunes", "Osteoporose/Osteopenia/Artrose", "Fibromialgia", "Depressão/Ansiedade/Síndrome do Pânico", "Câncer", "Outras"]},
//         {"id": "hs_doencas_espec", "tipo": "text", "titulo": "Especifique as Doenças Cardíacas/Autoimunes/Câncer/Outras (se aplicável)"},
//         {"id": "hs_meds", "tipo": "textarea", "titulo": "Medicamentos em uso (com dosagem)"},
//         {"id": "hs_supl", "tipo": "textarea", "titulo": "Suplementos em uso (com dosagem)"},
//         {"id": "hs_cirurg", "tipo": "textarea", "titulo": "Cirurgias ou Internações relevantes"},
//         {"id": "hs_alergias", "tipo": "checkbox", "titulo": "Alergias/Sensibilidades", "opcoes": ["Medicamentos", "Alimentos", "Pólen/Poeira/Fumaça/Ácaros", "Metais/Cosméticos/Tinturas de cabelo", "Outras"]},
//         {"id": "hs_alergias_espec", "tipo": "text", "titulo": "Especifique Medicamentos/Alimentos/Outras alergias"},
//         {"id": "hs_fam", "tipo": "checkbox", "titulo": "Histórico Familiar", "opcoes": ["Hipertensão", "Diabetes", "Câncer", "Doença Cardíaca", "Doença Tireoidiana", "Doença Autoimune", "Osteoporose", "Outros"]},
//         {"id": "hs_fam_espec", "tipo": "text", "titulo": "Especifique outros familiares"},
//         {"id": "sec_4", "tipo": "section", "titulo": "IV. AVALIAÇÃO POR SISTEMAS (Sintomas Atuais)"},
//         {"id": "av_cardio", "tipo": "checkbox", "titulo": "1. Cardiovascular e Circulatório", "opcoes": ["Dor no peito", "Palpitações", "Mãos/pés frios", "Inchaço (pernas, mãos)", "Pressão alta", "Tonturas", "Formigamento nos membros", "Varizes", "Outros"]},
//         {"id": "av_cardio_desc", "tipo": "textarea", "titulo": "Descrição (Cardiovascular)"},
//         {"id": "av_gastro", "tipo": "checkbox", "titulo": "2. Gastrointestinal e Digestório", "opcoes": ["Refluxo/azia", "Má digestão", "Gases/flatulência", "Inchaço abdominal", "Diarreia frequente", "Constipação", "Fezes irregulares", "Dor abdominal", "Sensibilidade a alimentos específicos", "Mau hálito", "Outros"]},
//         {"id": "av_gastro_freq", "tipo": "number", "titulo": "Frequência de evacuações (número/semana)"},
//         {"id": "av_gastro_bristol", "tipo": "text", "titulo": "Consistência (Escala de Bristol)"},
//         {"id": "av_hep", "tipo": "checkbox", "titulo": "3. Função Hepática e Biliar", "opcoes": ["Fadiga excessiva", "Dificuldade para digerir gorduras", "Dor no lado direito do abdômen", "Icterícia", "Urina escura", "Fezes claras", "Outros"]},
//         {"id": "av_panc", "tipo": "checkbox", "titulo": "4. Função Pancreática e Metabolismo do Açúcar", "opcoes": ["Sede excessiva", "Fome frequente", "Urinar muito", "Sonolência após refeições", "Histórico de diabetes na família", "Outros"]},
//         {"id": "av_renal", "tipo": "checkbox", "titulo": "5. Função Renal e Urinária", "opcoes": ["Dor ao urinar", "Urinar frequentemente", "Urina escura/com cheiro forte", "Inchaço facial ou corporal", "Infecções urinárias de repetição", "Outros"]},
//         {"id": "av_pulm", "tipo": "checkbox", "titulo": "6. Função Pulmonar e Respiratória", "opcoes": ["Tosse crônica", "Falta de ar", "Chiado no peito", "Asma/Bronquite", "Resfriados frequentes", "Outros"]},
//         {"id": "av_nerv", "tipo": "checkbox", "titulo": "7. Sistema Nervoso e Cognitivo", "opcoes": ["Estresse elevado", "Ansiedade", "Depressão", "Irritabilidade", "Mudanças de humor", "Dificuldade de concentração", "Perda de memória", "Dores de cabeça frequentes", "Tontura", "Dormência/formigamento", "Outros"]},
//         {"id": "av_oss", "tipo": "checkbox", "titulo": "8. Saúde Óssea e Articular", "opcoes": ["Dores nas articulações", "Rigidez matinal", "Dores musculares", "Fraturas frequentes", "Osteoporose/osteopenia", "Artrose/artrite/reumatismo", "Outros"]},
//         {"id": "av_end_tir", "tipo": "checkbox", "titulo": "9A. Sistema Endócrino e Hormonal - Tireoide", "opcoes": ["Cansaço/fadiga", "Ganho de peso", "Dificuldade para perder peso", "Perda de cabelo", "Pele seca", "Intolerância ao frio", "Irregularidade menstrual", "Constipação", "Dificuldade de concentração", "Outros"]},
//         {"id": "av_end_mul", "tipo": "checkbox", "titulo": "9B. Sistema Endócrino e Hormonal - Para Mulheres", "opcoes": ["Ciclo menstrual irregular", "TPM intensa", "Menopausa/Climatério", "Problemas ginecológicos", "Alterações nas mamas", "Outros"]},
//         {"id": "av_end_mul_espec", "tipo": "text", "titulo": "Especifique os sintomas de Menopausa ou Problemas ginecológicos"},
//         {"id": "av_end_hom", "tipo": "checkbox", "titulo": "9C. Sistema Endócrino e Hormonal - Para Homens", "opcoes": ["Baixa libido", "Disfunção erétil", "Alterações na próstata", "Fadiga", "Outros"]},
//         {"id": "av_imune", "tipo": "checkbox", "titulo": "10. Sistema Imunológico", "opcoes": ["Resfriados/gripes frequentes", "Infecções de repetição", "Cicatrização lenta", "Herpes de repetição", "Candidíase de repetição", "Outros"]},
//         {"id": "sec_5", "tipo": "section", "titulo": "V. ESTILO DE VIDA E HÁBITOS"},
//         {"id": "ev_alim_desc", "tipo": "textarea", "titulo": "1. Alimentação - Descrição da alimentação diária"},
//         {"id": "ev_alim_ultra", "tipo": "number", "titulo": "Frequência de ultraprocessados (número/semana)"},
//         {"id": "ev_alim_acuc", "tipo": "number", "titulo": "Frequência de açúcares (número/semana)"},
//         {"id": "ev_alim_farin", "tipo": "number", "titulo": "Frequência de farináceos refinados (número/semana)"},
//         {"id": "ev_alim_frit", "tipo": "number", "titulo": "Frequência de frituras (número/semana)"},
//         {"id": "ev_alim_carne", "tipo": "number", "titulo": "Frequência de carnes vermelhas (número/semana)"},
//         {"id": "ev_alim_peixe", "tipo": "number", "titulo": "Frequência de peixes (número/semana)"},
//         {"id": "ev_alim_fruta", "tipo": "number", "titulo": "Porções de frutas (número/dia)"},
//         {"id": "ev_alim_veg", "tipo": "number", "titulo": "Porções de vegetais (número/dia)"},
//         {"id": "ev_alim_lat", "tipo": "text", "titulo": "Consumo de laticínios (Sim/Não e Frequência)", "placeholder": "Ex: Sim, 2x ao dia"},
//         {"id": "ev_alim_glu", "tipo": "text", "titulo": "Consumo de glúten (Sim/Não e Frequência)", "placeholder": "Ex: Sim, 3x na semana"},
//         {"id": "ev_alim_rest", "tipo": "textarea", "titulo": "Restrições alimentares"},
//         {"id": "ev_hidr_agua", "tipo": "number", "titulo": "2. Hidratação - Consumo de água por dia (litros)"},
//         {"id": "ev_hidr_beb", "tipo": "checkbox", "titulo": "Outras bebidas", "opcoes": ["Bebidas açucaradas", "Chá"]},
//         {"id": "ev_hidr_cafe", "tipo": "number", "titulo": "Café (xícaras/dia)"},
//         {"id": "ev_hidr_outros", "tipo": "textarea", "titulo": "Outras bebidas (especifique)"},
//         {"id": "ev_sono_horas", "tipo": "number", "titulo": "3. Sono - Horas de sono por noite"},
//         {"id": "ev_sono_prob", "tipo": "checkbox", "titulo": "Problemas de sono", "opcoes": ["Dificuldade para iniciar o sono", "Acorda muitas vezes à noite", "Sono não reparador", "Insônia", "Ronco/Apneia"]},
//         {"id": "ev_sono_outros", "tipo": "textarea", "titulo": "Outros problemas de sono"},
//         {"id": "ev_estresse_nivel", "tipo": "number", "titulo": "4. Estresse e Saúde Mental - Nível de estresse (0-10)"},
//         {"id": "ev_estresse_fontes", "tipo": "checkbox", "titulo": "Fontes de estresse", "opcoes": ["Trabalho", "Família", "Finanças", "Saúde", "Outros"]},
//         {"id": "ev_estresse_sintomas", "tipo": "checkbox", "titulo": "Sintomas emocionais", "opcoes": ["Ansiedade", "Tristeza persistente", "Irritabilidade", "Crises de pânico"]},
//         {"id": "ev_estresse_hobbies", "tipo": "textarea", "titulo": "Hobbies/atividades relaxantes"},
//         {"id": "ev_fis_pratica", "tipo": "radio", "titulo": "5. Atividade Física - Pratica?", "opcoes": ["Sim", "Não"]},
//         {"id": "ev_fis_tipo", "tipo": "text", "titulo": "Tipo"},
//         {"id": "ev_fis_freq", "tipo": "number", "titulo": "Frequência (número/semana)"},
//         {"id": "ev_fis_dur", "tipo": "number", "titulo": "Duração (minutos)"},
//         {"id": "ev_tox_fumo", "tipo": "text", "titulo": "6. Exposição a Toxinas - Tabagismo", "placeholder": "Sim/Não/Ex-fumante (tempo)"},
//         {"id": "ev_tox_cigarros", "tipo": "number", "titulo": "Cigarros por dia (se sim)"},
//         {"id": "ev_tox_alcool", "tipo": "text", "titulo": "Consumo de álcool (Sim/Não + freq/qtd)"},
//         {"id": "ev_tox_quimicos", "tipo": "textarea", "titulo": "Exposição a químicos no trabalho/casa"},
//         {"id": "ev_tox_poluicao", "tipo": "textarea", "titulo": "Moradia próxima a áreas de poluição"},
//         {"id": "ev_tox_cosmeticos", "tipo": "radio", "titulo": "Utiliza cosméticos/produtos com muitos químicos?", "opcoes": ["Sim", "Não"]},
//         {"id": "ev_tox_panelas", "tipo": "radio", "titulo": "Utiliza panelas de alumínio?", "opcoes": ["Sim", "Não"]},
//         {"id": "sec_6", "tipo": "section", "titulo": "VI. QUEIXAS ESTÉTICAS ESPECÍFICAS"},
//         {"id": "qe_pele", "tipo": "checkbox", "titulo": "1. Pele", "opcoes": ["Acne", "Oleosidade excessiva", "Ressecamento", "Manchas", "Flacidez", "Rugas/Linhas de expressão", "Sensibilidade/Vermelhidão", "Rosácea", "Dermatite", "Coceira"]},
//         {"id": "qe_pele_acne_loc", "tipo": "text", "titulo": "Localização da Acne"},
//         {"id": "qe_pele_tipo", "tipo": "radio", "titulo": "Tipo de pele", "opcoes": ["Seca", "Normal", "Mista", "Oleosa", "Sensível"]},
//         {"id": "qe_pele_rotina", "tipo": "textarea", "titulo": "Rotina de cuidados com a pele"},
//         {"id": "qe_pele_produtos", "tipo": "textarea", "titulo": "Produtos utilizados"},
//         {"id": "qe_cabelo", "tipo": "checkbox", "titulo": "2. Cabelo", "opcoes": ["Queda de cabelo", "Oleosidade excessiva", "Ressecamento/Quebra", "Fios finos/Frágeis", "Caspa/Dermatite no couro cabeludo"]},
//         {"id": "qe_cabelo_outros", "tipo": "textarea", "titulo": "Outros (Cabelo)"},
//         {"id": "qe_unhas", "tipo": "checkbox", "titulo": "3. Unhas", "opcoes": ["Frágeis/Quebradiças", "Manchas", "Fungos", "Crescimento lento"]},
//         {"id": "qe_unhas_outros", "tipo": "textarea", "titulo": "Outros (Unhas)"},
//         {"id": "qe_corp", "tipo": "checkbox", "titulo": "4. Corporal", "opcoes": ["Gordura localizada", "Celulite", "Flacidez corporal", "Inchaço"]},
//         {"id": "qe_corp_loc", "tipo": "text", "titulo": "Localização (Gordura/Flacidez/Inchaço) e Grau (Celulite)"},
//         {"id": "qe_corp_outros", "tipo": "textarea", "titulo": "Outros (Corporal)"},
//         {"id": "qe_olhos", "tipo": "checkbox", "titulo": "5. Olhos", "opcoes": ["Olheiras", "Bolsas sob os olhos", "Rugas ao redor dos olhos", "Ressecamento ocular", "Fadiga visual", "Visão embaçada"]},
//         {"id": "qe_olhos_outros", "tipo": "textarea", "titulo": "Outros (Olhos)"},
//         {"id": "sec_7", "tipo": "section", "titulo": "VII. OBSERVAÇÕES DO PROFISSIONAL"},
//         {"id": "obs_prof", "tipo": "textarea", "titulo": "Anotações para o profissional"},
//         {"id": "obs_ass_cli", "tipo": "text", "titulo": "Assinatura do Cliente"},
//         {"id": "obs_ass_prof", "tipo": "text", "titulo": "Assinatura do Profissional"},
//         {"id": "amputados", "tipo": "radio", "titulo": "Tem órgãos amputados? (Biorressonância não identifica órgãos ausentes)", "opcoes": ["Sim", "Não"], "obrigatoria": true}
//       ]'::jsonb
//     );
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_user_subscription()
//   CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- We don't want to create subscriptions for patients
//     IF NEW.raw_user_meta_data->>'role' = 'paciente' THEN
//       RETURN NEW;
//     END IF;
//   
//     INSERT INTO public.subscriptions (user_id, trial_start_date, trial_end_date, status)
//     VALUES (
//       NEW.id,
//       NOW(),
//       NOW() + INTERVAL '7 days',
//       'trial'
//     )
//     ON CONFLICT (user_id) DO NOTHING;
//     
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION reset_tokens_mensais()
//   CREATE OR REPLACE FUNCTION public.reset_tokens_mensais()
//    RETURNS void
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     UPDATE tokens_inclusos
//     SET tokens_whatsapp_usado = 0,
//         tokens_prescricoes_usado = 0,
//         reset_em = NOW() + INTERVAL '1 month'
//     WHERE reset_em <= NOW();
//   END;
//   $function$
//   
// FUNCTION set_profissional_id()
//   CREATE OR REPLACE FUNCTION public.set_profissional_id()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF NEW.profissional_id IS NULL THEN
//       NEW.profissional_id := (SELECT id FROM public.profissionais WHERE user_id = NEW.user_id LIMIT 1);
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION update_config_ia_updated_at()
//   CREATE OR REPLACE FUNCTION public.update_config_ia_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION update_leads_updated_at()
//   CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: configuracao_ia
//   update_config_ia_updated_at_trigger: CREATE TRIGGER update_config_ia_updated_at_trigger BEFORE UPDATE ON public.configuracao_ia FOR EACH ROW EXECUTE FUNCTION update_config_ia_updated_at()
// Table: despesas
//   set_despesas_profissional_id: CREATE TRIGGER set_despesas_profissional_id BEFORE INSERT ON public.despesas FOR EACH ROW EXECUTE FUNCTION set_profissional_id()
// Table: leads
//   update_leads_updated_at_trigger: CREATE TRIGGER update_leads_updated_at_trigger BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at()
// Table: receitas
//   set_receitas_profissional_id: CREATE TRIGGER set_receitas_profissional_id BEFORE INSERT ON public.receitas FOR EACH ROW EXECUTE FUNCTION set_profissional_id()

// --- INDEXES ---
// Table: creditos_usuario
//   CREATE UNIQUE INDEX creditos_usuario_user_id_key ON public.creditos_usuario USING btree (user_id)
//   CREATE INDEX idx_creditos_usuario_user_id ON public.creditos_usuario USING btree (user_id)
// Table: cupons
//   CREATE UNIQUE INDEX cupons_codigo_key ON public.cupons USING btree (codigo)
//   CREATE INDEX idx_cupons_codigo ON public.cupons USING btree (codigo)
// Table: indicacoes
//   CREATE INDEX idx_indicacoes_indicador ON public.indicacoes USING btree (indicador_id)
// Table: movimentacoes_credito
//   CREATE INDEX idx_movimentacoes_user_id ON public.movimentacoes_credito USING btree (user_id)
// Table: pacientes
//   CREATE UNIQUE INDEX pacientes_cpf_active_idx ON public.pacientes USING btree (cpf) WHERE ((deleted_at IS NULL) AND (status <> 'deletado'::text) AND (cpf IS NOT NULL) AND (cpf <> ''::text))
//   CREATE UNIQUE INDEX pacientes_email_active_idx ON public.pacientes USING btree (email) WHERE ((deleted_at IS NULL) AND (status <> 'deletado'::text) AND (email IS NOT NULL) AND (email <> ''::text))
// Table: pacientes_acesso
//   CREATE UNIQUE INDEX pacientes_acesso_cpf_key ON public.pacientes_acesso USING btree (cpf)
//   CREATE UNIQUE INDEX pacientes_acesso_email_key ON public.pacientes_acesso USING btree (email)
// Table: pagamentos
//   CREATE INDEX idx_pagamentos_order_nsu ON public.pagamentos USING btree (order_nsu)
//   CREATE INDEX idx_pagamentos_user_id ON public.pagamentos USING btree (user_id)
//   CREATE UNIQUE INDEX pagamentos_order_nsu_key ON public.pagamentos USING btree (order_nsu)
// Table: profissionais_clinica
//   CREATE INDEX idx_profissionais_clinica_id ON public.profissionais_clinica USING btree (clinica_id)
//   CREATE UNIQUE INDEX profissionais_clinica_clinica_id_email_key ON public.profissionais_clinica USING btree (clinica_id, email)
// Table: tokens_comprados
//   CREATE INDEX idx_tokens_comprados_user_id ON public.tokens_comprados USING btree (user_id)
// Table: tokens_inclusos
//   CREATE INDEX idx_tokens_inclusos_user_id ON public.tokens_inclusos USING btree (user_id)
//   CREATE UNIQUE INDEX tokens_inclusos_user_id_mes_ano_key ON public.tokens_inclusos USING btree (user_id, mes_ano)
// Table: uso_tokens
//   CREATE INDEX idx_uso_tokens_user_id ON public.uso_tokens USING btree (user_id)

