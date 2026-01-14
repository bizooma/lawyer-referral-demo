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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attorneys: {
        Row: {
          bar_number: string
          capacity_status: string | null
          counties: string[]
          created_at: string | null
          email: string
          excluded_flags: string[] | null
          firm_name: string | null
          id: string
          is_active: boolean | null
          languages: string[] | null
          last_assigned_date: string | null
          name: string
          notes: string | null
          phone: string | null
          practice_areas: Database["public"]["Enums"]["practice_area"][]
          updated_at: string | null
        }
        Insert: {
          bar_number: string
          capacity_status?: string | null
          counties: string[]
          created_at?: string | null
          email: string
          excluded_flags?: string[] | null
          firm_name?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          last_assigned_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          practice_areas: Database["public"]["Enums"]["practice_area"][]
          updated_at?: string | null
        }
        Update: {
          bar_number?: string
          capacity_status?: string | null
          counties?: string[]
          created_at?: string | null
          email?: string
          excluded_flags?: string[] | null
          firm_name?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          last_assigned_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          practice_areas?: Database["public"]["Enums"]["practice_area"][]
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          attorney_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          intake_id: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          attorney_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          intake_id?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          attorney_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          intake_id?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_users: {
        Row: {
          created_at: string | null
          display_name: string
          email: string
          id: string
          role: Database["public"]["Enums"]["demo_role"]
        }
        Insert: {
          created_at?: string | null
          display_name: string
          email: string
          id?: string
          role: Database["public"]["Enums"]["demo_role"]
        }
        Update: {
          created_at?: string | null
          display_name?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["demo_role"]
        }
        Relationships: []
      }
      intakes: {
        Row: {
          area_of_law: Database["public"]["Enums"]["practice_area"]
          assigned_attorney_id: string | null
          caller_email: string | null
          caller_name: string
          caller_phone: string | null
          client_id: string
          county: string
          created_at: string | null
          id: string
          intake_number: string
          issue_date: string | null
          language_preference: string | null
          narrative: string | null
          payment_amount: number | null
          payment_method: string | null
          payment_notes: string | null
          referral_method: string | null
          referral_sent_at: string | null
          status: Database["public"]["Enums"]["intake_status"] | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          area_of_law: Database["public"]["Enums"]["practice_area"]
          assigned_attorney_id?: string | null
          caller_email?: string | null
          caller_name: string
          caller_phone?: string | null
          client_id: string
          county: string
          created_at?: string | null
          id?: string
          intake_number: string
          issue_date?: string | null
          language_preference?: string | null
          narrative?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_notes?: string | null
          referral_method?: string | null
          referral_sent_at?: string | null
          status?: Database["public"]["Enums"]["intake_status"] | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          area_of_law?: Database["public"]["Enums"]["practice_area"]
          assigned_attorney_id?: string | null
          caller_email?: string | null
          caller_name?: string
          caller_phone?: string | null
          client_id?: string
          county?: string
          created_at?: string | null
          id?: string
          intake_number?: string
          issue_date?: string | null
          language_preference?: string | null
          narrative?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_notes?: string | null
          referral_method?: string | null
          referral_sent_at?: string | null
          status?: Database["public"]["Enums"]["intake_status"] | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intakes_assigned_attorney_id_fkey"
            columns: ["assigned_attorney_id"]
            isOneToOne: false
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_rules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          rule_name: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          weight: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          weight?: number
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          disclaimer_text: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          disclaimer_text?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          disclaimer_text?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      demo_role: "intake_specialist" | "program_admin"
      intake_status:
        | "new"
        | "pending_match"
        | "matched"
        | "referred"
        | "closed"
        | "cancelled"
      practice_area:
        | "personal_injury"
        | "family_law"
        | "criminal_defense"
        | "estate_probate"
        | "immigration"
        | "business"
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
    Enums: {
      demo_role: ["intake_specialist", "program_admin"],
      intake_status: [
        "new",
        "pending_match",
        "matched",
        "referred",
        "closed",
        "cancelled",
      ],
      practice_area: [
        "personal_injury",
        "family_law",
        "criminal_defense",
        "estate_probate",
        "immigration",
        "business",
      ],
    },
  },
} as const
