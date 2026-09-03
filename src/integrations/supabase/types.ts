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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          cta: string
          href: string
          id: string
          image_url: string | null
          kind: string
          location: string
          published: boolean
          slug: string
          starts_at: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta?: string
          href?: string
          id?: string
          image_url?: string | null
          kind?: string
          location?: string
          published?: boolean
          slug: string
          starts_at: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta?: string
          href?: string
          id?: string
          image_url?: string | null
          kind?: string
          location?: string
          published?: boolean
          slug?: string
          starts_at?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_stream_sources: {
        Row: {
          access_code: string | null
          created_at: string
          mux_playback_id: string | null
          mux_stream_id: string | null
          mux_stream_key: string | null
          private_token: string | null
          source_type: Database["public"]["Enums"]["stream_source"]
          source_value: string
          stream_id: string
          updated_at: string
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          mux_playback_id?: string | null
          mux_stream_id?: string | null
          mux_stream_key?: string | null
          private_token?: string | null
          source_type?: Database["public"]["Enums"]["stream_source"]
          source_value?: string
          stream_id: string
          updated_at?: string
        }
        Update: {
          access_code?: string | null
          created_at?: string
          mux_playback_id?: string | null
          mux_stream_id?: string | null
          mux_stream_key?: string | null
          private_token?: string | null
          source_type?: Database["public"]["Enums"]["stream_source"]
          source_value?: string
          stream_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_sources_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: true
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          created_at: string
          id: string
          poster_url: string | null
          published: boolean
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["stream_status"]
          summary: string
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["stream_visibility"]
        }
        Insert: {
          created_at?: string
          id?: string
          poster_url?: string | null
          published?: boolean
          slug: string
          starts_at?: string
          status?: Database["public"]["Enums"]["stream_status"]
          summary?: string
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["stream_visibility"]
        }
        Update: {
          created_at?: string
          id?: string
          poster_url?: string | null
          published?: boolean
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["stream_status"]
          summary?: string
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["stream_visibility"]
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          href: string
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          href?: string
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          href?: string
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notified_content: {
        Row: {
          created_at: string
          id: string
          kind: string
          ref_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          ref_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          ref_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          attendee_type: Database["public"]["Enums"]["attendee_type"]
          cell_group: string
          country: string
          country_code: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          attendee_type?: Database["public"]["Enums"]["attendee_type"]
          cell_group?: string
          country?: string
          country_code?: string
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string
          updated_at?: string
        }
        Update: {
          attendee_type?: Database["public"]["Enums"]["attendee_type"]
          cell_group?: string
          country?: string
          country_code?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          href: string
          id: string
          kind: string
          notified_at: string | null
          poster_url: string | null
          remind_at: string | null
          target_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          href?: string
          id?: string
          kind: string
          notified_at?: string | null
          poster_url?: string | null
          remind_at?: string | null
          target_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          kind?: string
          notified_at?: string | null
          poster_url?: string | null
          remind_at?: string | null
          target_id?: string
          title?: string
          updated_at?: string
          user_id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      attendee_type: "member" | "guest"
      stream_source: "youtube" | "hls"
      stream_status: "scheduled" | "live" | "ended"
      stream_visibility: "public" | "code"
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
      app_role: ["admin", "user"],
      attendee_type: ["member", "guest"],
      stream_source: ["youtube", "hls"],
      stream_status: ["scheduled", "live", "ended"],
      stream_visibility: ["public", "code"],
    },
  },
} as const
