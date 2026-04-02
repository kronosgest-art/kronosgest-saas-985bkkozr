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
      anamnese: {
        Row: {
          anamnese_id: string
          atualizado_em: string
          criado_em: string
          organization_id: string | null
          patient_id: string | null
          respostas: Json
          template_id: string | null
        }
        Insert: {
          anamnese_id?: string
          atualizado_em?: string
          criado_em?: string
          organization_id?: string | null
          patient_id?: string | null
          respostas?: Json
          template_id?: string | null
        }
        Update: {
          anamnese_id?: string
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
          patient_id: string
          resultado_json: Json | null
          tipo: string
          updated_at: string
        }
        Insert: {
          arquivo_pdf_url?: string | null
          created_at?: string
          id?: string
          patient_id: string
          resultado_json?: Json | null
          tipo: string
          updated_at?: string
        }
        Update: {
          arquivo_pdf_url?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          resultado_json?: Json | null
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
          email: string | null
          id: string
          last_consultation: string | null
          nome_completo: string
          organization_id: string | null
          status: string | null
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_consultation?: string | null
          nome_completo: string
          organization_id?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_consultation?: string | null
          nome_completo?: string
          organization_id?: string | null
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
// Table: anamnese
//   anamnese_id: uuid (not null, default: gen_random_uuid())
//   patient_id: uuid (nullable)
//   organization_id: uuid (nullable)
//   template_id: uuid (nullable)
//   respostas: jsonb (not null, default: '[]'::jsonb)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
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

// --- CONSTRAINTS ---
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

// --- ROW LEVEL SECURITY POLICIES ---
// Table: anamnese
//   Policy "authenticated_all_anamnese" (ALL, PERMISSIVE) roles={authenticated}
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
// Table: exames
//   Policy "authenticated_all_exames" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
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
//   Policy "authenticated_all_pacientes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: patients
//   Policy "authenticated_all_patients" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: prescricoes
//   Policy "authenticated_all_prescricoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

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
//       'Padrão Morgana',
//       true,
//       '[
//         {"id": "1", "titulo": "Dados Pessoais", "tipo": "text", "obrigatoria": true},
//         {"id": "2", "titulo": "Queixa Principal", "tipo": "text", "obrigatoria": true},
//         {"id": "3", "titulo": "Histórico de Saúde", "tipo": "text", "obrigatoria": false},
//         {"id": "4", "titulo": "Avaliação por Sistemas", "tipo": "text", "obrigatoria": false},
//         {"id": "5", "titulo": "Estilo de Vida", "tipo": "text", "obrigatoria": false},
//         {"id": "6", "titulo": "Queixas Estéticas", "tipo": "text", "obrigatoria": false},
//         {"id": "7", "titulo": "Observações do Profissional", "tipo": "text", "obrigatoria": false},
//         {"id": "8", "titulo": "Tem órgãos amputados? (Biorressonância não identifica órgãos ausentes)", "tipo": "select", "opcoes": ["Sim", "Não"], "obrigatoria": true}
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
