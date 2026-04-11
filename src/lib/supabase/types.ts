// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          criado_em: string
          data: string
          horario: string
          id: string
          observacoes: string | null
          patient_id: string
          tipo_consulta: string
        }
        Insert: {
          criado_em?: string
          data: string
          horario: string
          id?: string
          observacoes?: string | null
          patient_id: string
          tipo_consulta: string
        }
        Update: {
          criado_em?: string
          data?: string
          horario?: string
          id?: string
          observacoes?: string | null
          patient_id?: string
          tipo_consulta?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agendamentos_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
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
            foreignKeyName: 'anamnese_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'anamnese_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'anamnese_templates'
            referencedColumns: ['template_id']
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
            foreignKeyName: 'exames_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
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
          id?: string
          msg?: string | null
          name?: string
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          cpf: string | null
          created_at: string
          data_nascimento: string | null
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
      patients: {
        Row: {
          cpf: string | null
          created_at: string
          id: string
          last_consultation: string | null
          name: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          id?: string
          last_consultation?: string | null
          name: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          id?: string
          last_consultation?: string | null
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
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
            foreignKeyName: 'prescricoes_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
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
            foreignKeyName: 'tcle_assinado_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
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
// Table: agendamentos
//   id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (not null)
//   data: date (not null)
//   horario: time without time zone (not null)
//   tipo_consulta: text (not null)
//   observacoes: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
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
// Table: patients
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   name: text (not null)
//   cpf: text (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   last_consultation: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: prescricoes
//   id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (not null)
//   anamnese_id: text (nullable)
//   exames_ids: _uuid (nullable)
//   conteudo_json: jsonb (nullable)
//   arquivo_pdf_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: tcle_assinado
//   id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (not null)
//   assinatura: text (not null)
//   data_assinatura: timestamp with time zone (not null, default: now())
//   tipo_assinatura: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: agendamentos
//   FOREIGN KEY agendamentos_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY agendamentos_pkey: PRIMARY KEY (id)
// Table: anamnese
//   FOREIGN KEY anamnese_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY anamnese_pkey: PRIMARY KEY (anamnese_id)
//   FOREIGN KEY anamnese_template_id_fkey: FOREIGN KEY (template_id) REFERENCES anamnese_templates(template_id) ON DELETE SET NULL
// Table: anamnese_templates
//   PRIMARY KEY anamnese_templates_pkey: PRIMARY KEY (template_id)
//   FOREIGN KEY anamnese_templates_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: exames
//   FOREIGN KEY exames_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY exames_pkey: PRIMARY KEY (id)
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: pacientes
//   UNIQUE pacientes_cpf_key: UNIQUE (cpf)
//   UNIQUE pacientes_email_key: UNIQUE (email)
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pacientes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: patients
//   PRIMARY KEY patients_pkey: PRIMARY KEY (id)
//   FOREIGN KEY patients_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: prescricoes
//   FOREIGN KEY prescricoes_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY prescricoes_pkey: PRIMARY KEY (id)
// Table: tcle_assinado
//   FOREIGN KEY tcle_assinado_patient_id_fkey: FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY tcle_assinado_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: agendamentos
//   Policy "agendamentos_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = agendamentos.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = agendamentos.patient_id) AND (pacientes.user_id = auth.uid()))))
// Table: anamnese
//   Policy "anamnese_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = anamnese.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = anamnese.patient_id) AND (pacientes.user_id = auth.uid()))))
// Table: anamnese_templates
//   Policy "Users can delete their own templates" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = profissional_id)
//   Policy "Users can insert their own templates" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = profissional_id)
//   Policy "Users can update their own templates" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = profissional_id)
//   Policy "Users can view their own templates" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = profissional_id)
// Table: exames
//   Policy "exames_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = exames.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = exames.patient_id) AND (pacientes.user_id = auth.uid()))))
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
// Table: pacientes
//   Policy "pacientes_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: patients
//   Policy "patients_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: prescricoes
//   Policy "prescricoes_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = prescricoes.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = prescricoes.patient_id) AND (pacientes.user_id = auth.uid()))))
// Table: tcle_assinado
//   Policy "tcle_assinado_user_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = tcle_assinado.patient_id) AND (pacientes.user_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM pacientes   WHERE ((pacientes.id = tcle_assinado.patient_id) AND (pacientes.user_id = auth.uid()))))

// --- DATABASE FUNCTIONS ---
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
// Table: leads
//   update_leads_updated_at_trigger: CREATE TRIGGER update_leads_updated_at_trigger BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at()

// --- INDEXES ---
// Table: pacientes
//   CREATE UNIQUE INDEX pacientes_cpf_key ON public.pacientes USING btree (cpf)
//   CREATE UNIQUE INDEX pacientes_email_key ON public.pacientes USING btree (email)
