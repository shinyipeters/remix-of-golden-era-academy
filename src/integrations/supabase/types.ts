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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          created_at: string
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string
        }
        Update: {
          created_at?: string
          permission?: Database["public"]["Enums"]["admin_permission"]
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          body: string
          category: string
          created_at: string
          created_by: string | null
          id: string
          image_path: string | null
          publish_at: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_path?: string | null
          publish_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_path?: string | null
          publish_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: number
          new_values: Json | null
          old_values: Json | null
          reason: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: number
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: number
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
        }
        Relationships: []
      }
      course_training: {
        Row: {
          course_id: string
          instructions: string
          link: string
          platform: string
          updated_at: string
        }
        Insert: {
          course_id: string
          instructions?: string
          link?: string
          platform?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          instructions?: string
          link?: string
          platform?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_training_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          certification_requirements: string
          created_at: string
          currency: string
          curriculum: string[]
          delivery_notes: string
          description: string
          disclaimer: string
          duration: string | null
          enrolment_instructions: string
          entry_requirements: string
          icon: string
          id: string
          image_path: string | null
          objectives: string[]
          outcomes: string
          price: number | null
          short_description: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          suitable_for: string
          title: string
          updated_at: string
        }
        Insert: {
          certification_requirements?: string
          created_at?: string
          currency?: string
          curriculum?: string[]
          delivery_notes?: string
          description?: string
          disclaimer?: string
          duration?: string | null
          enrolment_instructions?: string
          entry_requirements?: string
          icon?: string
          id?: string
          image_path?: string | null
          objectives?: string[]
          outcomes?: string
          price?: number | null
          short_description?: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          suitable_for?: string
          title: string
          updated_at?: string
        }
        Update: {
          certification_requirements?: string
          created_at?: string
          currency?: string
          curriculum?: string[]
          delivery_notes?: string
          description?: string
          disclaimer?: string
          duration?: string | null
          enrolment_instructions?: string
          entry_requirements?: string
          icon?: string
          id?: string
          image_path?: string | null
          objectives?: string[]
          outcomes?: string
          price?: number | null
          short_description?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          suitable_for?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          email: string
          full_name: string
          id: string
          internal_notes: string | null
          message: string
          organisation: string | null
          phone: string | null
          preferred_contact: string | null
          reference: string
          source: string
          status: Database["public"]["Enums"]["enquiry_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          internal_notes?: string | null
          message: string
          organisation?: string | null
          phone?: string | null
          preferred_contact?: string | null
          reference?: string
          source?: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          internal_notes?: string | null
          message?: string
          organisation?: string | null
          phone?: string | null
          preferred_contact?: string | null
          reference?: string
          source?: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
        }
        Relationships: []
      }
      enquiry_responses: {
        Row: {
          author_email: string | null
          author_id: string | null
          channel: string
          created_at: string
          enquiry_id: string
          id: number
          note: string
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          channel?: string
          created_at?: string
          enquiry_id: string
          id?: number
          note: string
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          channel?: string
          created_at?: string
          enquiry_id?: string
          id?: number
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiry_responses_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      enrolments: {
        Row: {
          admin_notes: string | null
          amount_due: number | null
          certificate_issued_at: string | null
          certificate_issued_by: string | null
          certificate_number: string | null
          course_id: string
          course_title: string
          created_at: string
          currency: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          reference: string
          requirements_met: boolean
          status: Database["public"]["Enums"]["enrolment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount_due?: number | null
          certificate_issued_at?: string | null
          certificate_issued_by?: string | null
          certificate_number?: string | null
          course_id: string
          course_title: string
          created_at?: string
          currency?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          reference?: string
          requirements_met?: boolean
          status?: Database["public"]["Enums"]["enrolment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount_due?: number | null
          certificate_issued_at?: string | null
          certificate_issued_by?: string | null
          certificate_number?: string | null
          course_id?: string
          course_title?: string
          created_at?: string
          currency?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          reference?: string
          requirements_met?: boolean
          status?: Database["public"]["Enums"]["enrolment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrolments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          caption: string
          consent_confirmed: boolean
          created_at: string
          id: string
          image_path: string
          published: boolean
          sort_order: number
        }
        Insert: {
          caption?: string
          consent_confirmed?: boolean
          created_at?: string
          id?: string
          image_path: string
          published?: boolean
          sort_order?: number
        }
        Update: {
          caption?: string
          consent_confirmed?: boolean
          created_at?: string
          id?: string
          image_path?: string
          published?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          dedupe_key: string | null
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          dedupe_key?: string | null
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          dedupe_key?: string | null
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          created_at: string
          enrolment_id: string | null
          id: number
          new_status: string
          payment_id: string | null
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          enrolment_id?: string | null
          id?: number
          new_status: string
          payment_id?: string | null
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          enrolment_id?: string | null
          id?: number
          new_status?: string
          payment_id?: string | null
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          admin_notes: string | null
          amount_submitted: number | null
          created_at: string
          enrolment_id: string
          evidence_path: string | null
          id: string
          method: string
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
          student_note: string | null
          transaction_reference: string | null
          verified_at: string | null
          verified_by: string | null
          verified_by_email: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_submitted?: number | null
          created_at?: string
          enrolment_id: string
          evidence_path?: string | null
          id?: string
          method: string
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
          student_note?: string | null
          transaction_reference?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_email?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_submitted?: number | null
          created_at?: string
          enrolment_id?: string
          evidence_path?: string | null
          id?: string
          method?: string
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
          student_note?: string | null
          transaction_reference?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_enrolment_id_fkey"
            columns: ["enrolment_id"]
            isOneToOne: false
            referencedRelation: "enrolments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_enrolment: { Args: { _course_id: string }; Returns: string }
      has_perm: {
        Args: {
          _perm: Database["public"]["Enums"]["admin_permission"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      list_admins: {
        Args: never
        Returns: {
          email: string
          full_name: string
          permissions: Database["public"]["Enums"]["admin_permission"][]
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      my_access: { Args: never; Returns: Json }
      notify: {
        Args: {
          _body: string
          _dedupe: string
          _kind: string
          _link: string
          _title: string
        }
        Returns: undefined
      }
      remove_admin: { Args: { _user_id: string }; Returns: undefined }
      review_payment: {
        Args: {
          _decision: Database["public"]["Enums"]["payment_status"]
          _notes: string
          _payment_id: string
        }
        Returns: undefined
      }
      set_admin: {
        Args: {
          _email: string
          _permissions: Database["public"]["Enums"]["admin_permission"][]
        }
        Returns: undefined
      }
      submit_enquiry: {
        Args: {
          _category: string
          _email: string
          _full_name: string
          _message: string
          _organisation: string
          _phone: string
          _preferred: string
          _source: string
        }
        Returns: string
      }
      verify_certificate: {
        Args: { _number: string }
        Returns: {
          course_title: string
          issued_at: string
          student_name: string
        }[]
      }
      write_audit: {
        Args: {
          _action: string
          _entity: string
          _entity_id: string
          _new: Json
          _old: Json
          _reason?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      admin_permission:
        | "courses"
        | "students"
        | "payments"
        | "content"
        | "enquiries"
        | "settings"
        | "certificates"
        | "exports"
      app_role: "super_admin" | "admin" | "student"
      content_status: "draft" | "published" | "archived"
      enquiry_status: "new" | "in_progress" | "awaiting_response" | "resolved"
      enrolment_status:
        | "registration_received"
        | "awaiting_payment"
        | "payment_submitted"
        | "payment_verified"
        | "admission_approved"
        | "enrolled"
        | "rejected"
        | "suspended"
        | "completed"
        | "certificate_issued"
      payment_status:
        | "not_started"
        | "awaiting_payment"
        | "submitted"
        | "verified"
        | "rejected"
        | "disputed"
        | "refunded"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      admin_permission: [
        "courses",
        "students",
        "payments",
        "content",
        "enquiries",
        "settings",
        "certificates",
        "exports",
      ],
      app_role: ["super_admin", "admin", "student"],
      content_status: ["draft", "published", "archived"],
      enquiry_status: ["new", "in_progress", "awaiting_response", "resolved"],
      enrolment_status: [
        "registration_received",
        "awaiting_payment",
        "payment_submitted",
        "payment_verified",
        "admission_approved",
        "enrolled",
        "rejected",
        "suspended",
        "completed",
        "certificate_issued",
      ],
      payment_status: [
        "not_started",
        "awaiting_payment",
        "submitted",
        "verified",
        "rejected",
        "disputed",
        "refunded",
      ],
    },
  },
} as const
