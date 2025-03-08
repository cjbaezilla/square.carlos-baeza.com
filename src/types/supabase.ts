export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      mascot_equipped_items: {
        Row: {
          created_at: string | null
          equipped_at: string | null
          id: number
          item_id: string
          mascot_id: string
          slot: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          equipped_at?: string | null
          id?: number
          item_id: string
          mascot_id: string
          slot: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          equipped_at?: string | null
          id?: number
          item_id?: string
          mascot_id?: string
          slot?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_type: string
          action_value: string | null
          created_at: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          action_value?: string | null
          created_at?: string | null
          id?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          action_value?: string | null
          created_at?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_active_mascots: {
        Row: {
          activated_at: string | null
          active_mascot_id: string
          created_at: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          active_mascot_id: string
          created_at?: string | null
          id?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          active_mascot_id?: string
          created_at?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string | null
          earned_at: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string | null
          earned_at?: string | null
          id?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string | null
          earned_at?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_items: {
        Row: {
          created_at: string | null
          id: number
          item_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          item_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          item_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_mascots: {
        Row: {
          acquired_at: string | null
          created_at: string | null
          experience: number
          id: number
          level: number
          mascot_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          created_at?: string | null
          experience?: number
          id?: number
          level?: number
          mascot_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          created_at?: string | null
          experience?: number
          id?: number
          level?: number
          mascot_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string | null
          id: number
          last_login: string | null
          level: number
          points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_login?: string | null
          level?: number
          points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          last_login?: string | null
          level?: number
          points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
