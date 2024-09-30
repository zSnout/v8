export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      StoryContrib: {
        Row: {
          author: string
          content: string
          created_at: string
          id: number
          thread: number
        }
        Insert: {
          author?: string
          content: string
          created_at?: string
          id?: number
          thread: number
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: number
          thread?: number
        }
        Relationships: [
          {
            foreignKeyName: "StoryContrib_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StoryContrib_thread_fkey"
            columns: ["thread"]
            isOneToOne: false
            referencedRelation: "StoryThread"
            referencedColumns: ["id"]
          },
        ]
      }
      StoryGroup: {
        Row: {
          created_at: string
          id: number
          manager: string
        }
        Insert: {
          created_at?: string
          id: number
          manager: string
        }
        Update: {
          created_at?: string
          id?: number
          manager?: string
        }
        Relationships: [
          {
            foreignKeyName: "StoryGroup_manager_fkey"
            columns: ["manager"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      StoryMember: {
        Row: {
          created_at: string
          gems: number
          id: number
          stat_contribs: number
          stat_last_contrib: string
          stat_threads_created: number
          stat_unique_thread_contribs: number
          story_group: number
          user: string
        }
        Insert: {
          created_at?: string
          gems?: number
          id?: number
          stat_contribs?: number
          stat_last_contrib?: string
          stat_threads_created?: number
          stat_unique_thread_contribs?: number
          story_group: number
          user?: string
        }
        Update: {
          created_at?: string
          gems?: number
          id?: number
          stat_contribs?: number
          stat_last_contrib?: string
          stat_threads_created?: number
          stat_unique_thread_contribs?: number
          story_group?: number
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "StoryMember_story_group_fkey"
            columns: ["story_group"]
            isOneToOne: false
            referencedRelation: "StoryGroup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StoryMember_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      StoryThread: {
        Row: {
          created_at: string
          group: number
          id: number
        }
        Insert: {
          created_at?: string
          group: number
          id: number
        }
        Update: {
          created_at?: string
          group?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "StoryThread_group_fkey"
            columns: ["group"]
            isOneToOne: false
            referencedRelation: "StoryGroup"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          created_at: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
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
  TableName extends PublicTableNameOrOptions extends (
    { schema: keyof Database }
  ) ?
    keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> =
  PublicTableNameOrOptions extends { schema: keyof Database } ?
    (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends (
      {
        Row: infer R
      }
    ) ?
      R
    : never
  : PublicTableNameOrOptions extends (
    keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  ) ?
    (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends (
      {
        Row: infer R
      }
    ) ?
      R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends (
    { schema: keyof Database }
  ) ?
    keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> =
  PublicTableNameOrOptions extends { schema: keyof Database } ?
    Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends (
      {
        Insert: infer I
      }
    ) ?
      I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"] ?
    PublicSchema["Tables"][PublicTableNameOrOptions] extends (
      {
        Insert: infer I
      }
    ) ?
      I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends (
    { schema: keyof Database }
  ) ?
    keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> =
  PublicTableNameOrOptions extends { schema: keyof Database } ?
    Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends (
      {
        Update: infer U
      }
    ) ?
      U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"] ?
    PublicSchema["Tables"][PublicTableNameOrOptions] extends (
      {
        Update: infer U
      }
    ) ?
      U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database } ?
    keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> =
  PublicEnumNameOrOptions extends { schema: keyof Database } ?
    Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] ?
    PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.PUBLIC_V8_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_V8_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
