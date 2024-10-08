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
          author: string
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
          name: string
        }
        Insert: {
          created_at?: string
          id: number
          manager?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          manager?: string
          name?: string
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
      StoryMemberRaw: {
        Row: {
          group: number
          id: number
          user: string
        }
        Insert: {
          group: number
          id?: number
          user: string
        }
        Update: {
          group?: number
          id?: number
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "StoryMemberRaw_group_fkey"
            columns: ["group"]
            isOneToOne: false
            referencedRelation: "StoryGroup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StoryMemberRaw_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      StoryMemberStats: {
        Row: {
          created_at: string
          gems: number
          group: number
          id: number
          stat_contribs: number
          stat_last_contrib: string | null
          stat_threads_completed: number
          stat_threads_created: number
          stat_unique_thread_contribs: number
          user: string
        }
        Insert: {
          created_at?: string
          gems?: number
          group: number
          id?: number
          stat_contribs?: number
          stat_last_contrib?: string | null
          stat_threads_completed?: number
          stat_threads_created?: number
          stat_unique_thread_contribs?: number
          user: string
        }
        Update: {
          created_at?: string
          gems?: number
          group?: number
          id?: number
          stat_contribs?: number
          stat_last_contrib?: string | null
          stat_threads_completed?: number
          stat_threads_created?: number
          stat_unique_thread_contribs?: number
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "StoryMember_group_fkey"
            columns: ["group"]
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
          author: string
          complete: boolean
          created_at: string
          group: number
          id: number
        }
        Insert: {
          author: string
          complete?: boolean
          created_at?: string
          group: number
          id: number
        }
        Update: {
          author?: string
          complete?: boolean
          created_at?: string
          group?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "StoryThread_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
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
      StoryMemberStatsUI: {
        Row: {
          created_at: string | null
          gems: number | null
          group: number | null
          id: number | null
          stat_contribs: number | null
          stat_last_contrib: string | null
          stat_threads_created: number | null
          stat_unique_thread_contribs: number | null
          user: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "StoryMember_group_fkey"
            columns: ["group"]
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
      StoryThreadCompleteWithContent: {
        Row: {
          content: string | null
          group: number | null
          thread: number | null
        }
        Relationships: [
          {
            foreignKeyName: "StoryContrib_thread_fkey"
            columns: ["thread"]
            isOneToOne: false
            referencedRelation: "StoryThread"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StoryThread_group_fkey"
            columns: ["group"]
            isOneToOne: false
            referencedRelation: "StoryGroup"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      contrib_timestamps: {
        Args: {
          group_id: number
        }
        Returns: {
          created_at: number
        }[]
      }
      create_story: {
        Args: {
          name: string
          group_id: number
        }
        Returns: undefined
      }
      create_thread: {
        Args: {
          group_id: number
          content_new: string
          thread_id: number
        }
        Returns: undefined
      }
      full_stats: {
        Args: {
          group_id: number
        }
        Returns: {
          gems: number
          stat_contribs: number
          stat_last_contrib: string
          stat_threads_completed: number
          stat_threads_created: number
          stat_unique_thread_contribs: number
          username: string
          blocked_on: number
        }[]
      }
      get_incomplete_contribs: {
        Args: {
          group_id: number
        }
        Returns: {
          contrib: number
          thread: number
          is_mine: boolean
        }[]
      }
      get_last_contrib: {
        Args: {
          thread_id: number
        }
        Returns: {
          content: string
          id: number
        }[]
      }
      push_contrib: {
        Args: {
          last_contrib: number
          my_content: string
        }
        Returns: undefined
      }
      push_final_contrib: {
        Args: {
          last_contrib: number
          my_content: string
        }
        Returns: undefined
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
