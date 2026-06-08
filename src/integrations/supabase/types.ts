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
      attorney_profiles: {
        Row: {
          accepting_referrals: boolean | null
          attorney_id: string
          bio: string | null
          created_at: string | null
          demo_user_id: string
          id: string
          profile_photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          accepting_referrals?: boolean | null
          attorney_id: string
          bio?: string | null
          created_at?: string | null
          demo_user_id: string
          id?: string
          profile_photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          accepting_referrals?: boolean | null
          attorney_id?: string
          bio?: string | null
          created_at?: string | null
          demo_user_id?: string
          id?: string
          profile_photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attorney_profiles_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: true
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attorney_profiles_demo_user_id_fkey"
            columns: ["demo_user_id"]
            isOneToOne: true
            referencedRelation: "demo_users"
            referencedColumns: ["id"]
          },
        ]
      }
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          phone?: string | null
          practice_areas?: Database["public"]["Enums"]["practice_area"][]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attorneys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          attorney_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          intake_id: string | null
          organization_id: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          attorney_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          intake_id?: string | null
          organization_id?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          attorney_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          intake_id?: string | null
          organization_id?: string | null
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
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          address: string | null
          created_at: string | null
          demo_user_id: string
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          demo_user_id: string
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          demo_user_id?: string
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_demo_user_id_fkey"
            columns: ["demo_user_id"]
            isOneToOne: true
            referencedRelation: "demo_users"
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
          demo_user_id: string | null
          id: string
          intake_number: string
          issue_date: string | null
          language_preference: string | null
          narrative: string | null
          organization_id: string | null
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
          demo_user_id?: string | null
          id?: string
          intake_number: string
          issue_date?: string | null
          language_preference?: string | null
          narrative?: string | null
          organization_id?: string | null
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
          demo_user_id?: string | null
          id?: string
          intake_number?: string
          issue_date?: string | null
          language_preference?: string | null
          narrative?: string | null
          organization_id?: string | null
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
          {
            foreignKeyName: "intakes_demo_user_id_fkey"
            columns: ["demo_user_id"]
            isOneToOne: false
            referencedRelation: "demo_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intakes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
          rule_name: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          rule_name: string
          weight: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          rule_name?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "matching_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_domains: {
        Row: {
          created_at: string
          domain_type: string
          hostname: string
          id: string
          is_primary: boolean
          last_checked_at: string | null
          organization_id: string
          ssl_status: string
          status: string
          updated_at: string
          verification_token: string
        }
        Insert: {
          created_at?: string
          domain_type: string
          hostname: string
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          organization_id: string
          ssl_status?: string
          status?: string
          updated_at?: string
          verification_token?: string
        }
        Update: {
          created_at?: string
          domain_type?: string
          hostname?: string
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          organization_id?: string
          ssl_status?: string
          status?: string
          updated_at?: string
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      organizations: {
        Row: {
          accent_color: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          disclaimer_text: string | null
          favicon_url: string | null
          id: string
          is_demo: boolean
          logo_url: string | null
          name: string
          plan_tier: string
          primary_color: string | null
          slug: string
          status: string
          stripe_customer_id: string | null
          subdomain: string | null
          support_url: string | null
          updated_at: string
          widget_intro: string | null
        }
        Insert: {
          accent_color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          disclaimer_text?: string | null
          favicon_url?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name: string
          plan_tier?: string
          primary_color?: string | null
          slug: string
          status?: string
          stripe_customer_id?: string | null
          subdomain?: string | null
          support_url?: string | null
          updated_at?: string
          widget_intro?: string | null
        }
        Update: {
          accent_color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          disclaimer_text?: string | null
          favicon_url?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name?: string
          plan_tier?: string
          primary_color?: string | null
          slug?: string
          status?: string
          stripe_customer_id?: string | null
          subdomain?: string | null
          support_url?: string | null
          updated_at?: string
          widget_intro?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_responses: {
        Row: {
          attorney_id: string
          created_at: string | null
          id: string
          intake_id: string
          notes: string | null
          organization_id: string | null
          response_date: string | null
          status: Database["public"]["Enums"]["referral_status"] | null
        }
        Insert: {
          attorney_id: string
          created_at?: string | null
          id?: string
          intake_id: string
          notes?: string | null
          organization_id?: string | null
          response_date?: string | null
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Update: {
          attorney_id?: string
          created_at?: string | null
          id?: string
          intake_id?: string
          notes?: string | null
          organization_id?: string | null
          response_date?: string | null
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_responses_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_responses_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_branding_by_host: {
        Args: { _host: string }
        Returns: {
          accent_color: string
          contact_email: string
          contact_phone: string
          disclaimer_text: string
          favicon_url: string
          logo_url: string
          name: string
          organization_id: string
          primary_color: string
          support_url: string
          widget_intro: string
        }[]
      }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      user_org_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role: "program_admin" | "intake_specialist"
      demo_role: "intake_specialist" | "program_admin" | "client" | "attorney"
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
      referral_status: "pending" | "accepted" | "declined" | "contacted"
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
      app_role: ["program_admin", "intake_specialist"],
      demo_role: ["intake_specialist", "program_admin", "client", "attorney"],
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
      referral_status: ["pending", "accepted", "declined", "contacted"],
    },
  },
} as const
