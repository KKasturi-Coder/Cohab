export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          rent_amount: number | null
          currency: string
          room_type: 'private' | 'shared' | 'studio' | 'apartment' | null
          amenities: string[] | null
          images: string[] | null
          is_available: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          rent_amount?: number | null
          currency?: string
          room_type?: 'private' | 'shared' | 'studio' | 'apartment' | null
          amenities?: string[] | null
          images?: string[] | null
          is_available?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          rent_amount?: number | null
          currency?: string
          room_type?: 'private' | 'shared' | 'studio' | 'apartment' | null
          amenities?: string[] | null
          images?: string[] | null
          is_available?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      roommates: {
        Row: {
          id: string
          user_id: string
          room_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'left'
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          status?: 'pending' | 'accepted' | 'rejected' | 'left'
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'left'
          joined_at?: string
          left_at?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          room_id: string
          title: string
          description: string | null
          amount: number
          currency: string
          category: 'rent' | 'utilities' | 'groceries' | 'cleaning' | 'maintenance' | 'other'
          paid_by: string
          created_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          room_id: string
          title: string
          description?: string | null
          amount: number
          currency?: string
          category: 'rent' | 'utilities' | 'groceries' | 'cleaning' | 'maintenance' | 'other'
          paid_by: string
          created_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          title?: string
          description?: string | null
          amount?: number
          currency?: string
          category?: 'rent' | 'utilities' | 'groceries' | 'cleaning' | 'maintenance' | 'other'
          paid_by?: string
          created_at?: string
          due_date?: string | null
        }
      }
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          amount: number
          is_paid: boolean
          paid_at: string | null
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          amount: number
          is_paid?: boolean
          paid_at?: string | null
        }
        Update: {
          id?: string
          expense_id?: string
          user_id?: string
          amount?: number
          is_paid?: boolean
          paid_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'file' | 'expense'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'image' | 'file' | 'expense'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'file' | 'expense'
          metadata?: Json | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'expense' | 'message' | 'roommate' | 'system'
          is_read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'expense' | 'message' | 'roommate' | 'system'
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'expense' | 'message' | 'roommate' | 'system'
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
        }
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
  }
}
