import type { Database } from './database.types'
import { supabase } from './supabase'

// Type aliases for easier use
type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Room = Tables['rooms']['Row']
type Roommate = Tables['roommates']['Row']
type Expense = Tables['expenses']['Row']
type Message = Tables['messages']['Row']

// Auth helpers
export const auth = {
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// Profile helpers
export const profiles = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  }
}

// Room helpers
export const rooms = {
  async getRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        roommates!inner(user_id, status),
        profiles!rooms_created_by_fkey(full_name, avatar_url)
      `)
      .eq('roommates.status', 'accepted')
    return { data, error }
  },

  async getRoom(roomId: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        roommates!inner(user_id, status, profiles(full_name, avatar_url)),
        profiles!rooms_created_by_fkey(full_name, avatar_url)
      `)
      .eq('id', roomId)
      .single()
    return { data, error }
  },

  async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single()
    return { data, error }
  },

  async updateRoom(roomId: string, updates: Partial<Room>) {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single()
    return { data, error }
  }
}

// Roommate helpers
export const roommates = {
  async joinRoom(roomId: string, userId: string) {
    const { data, error } = await supabase
      .from('roommates')
      .insert({
        room_id: roomId,
        user_id: userId,
        status: 'pending'
      })
      .select()
      .single()
    return { data, error }
  },

  async acceptRoommate(roommateId: string) {
    const { data, error } = await supabase
      .from('roommates')
      .update({ status: 'accepted' })
      .eq('id', roommateId)
      .select()
      .single()
    return { data, error }
  },

  async getRoommates(roomId: string) {
    const { data, error } = await supabase
      .from('roommates')
      .select(`
        *,
        profiles(full_name, avatar_url, email)
      `)
      .eq('room_id', roomId)
      .eq('status', 'accepted')
    return { data, error }
  }
}

// Expense helpers
export const expenses = {
  async getExpenses(roomId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        profiles!expenses_paid_by_fkey(full_name, avatar_url),
        expense_splits(
          *,
          profiles(full_name, avatar_url)
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single()
    return { data, error }
  },

  async createExpenseSplit(expenseId: string, userId: string, amount: number) {
    const { data, error } = await supabase
      .from('expense_splits')
      .insert({
        expense_id: expenseId,
        user_id: userId,
        amount
      })
      .select()
      .single()
    return { data, error }
  }
}

// Message helpers
export const messages = {
  async getMessages(roomId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  async sendMessage(message: Omit<Message, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select(`
        *,
        profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
      .single()
    return { data, error }
  }
}

// Real-time subscriptions
export const subscribeToRoom = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
      callback
    )
    .subscribe()
}

export const subscribeToExpenses = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`expenses:${roomId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'expenses', filter: `room_id=eq.${roomId}` },
      callback
    )
    .subscribe()
}
