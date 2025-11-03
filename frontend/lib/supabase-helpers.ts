import type { Database } from './database.types'
import { supabase } from './supabase'

// Type aliases for easier use
type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Room = Tables['households']['Row']
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
export const households = {
  async getHouseholds() {
    const { data, error } = await supabase
      .from('households')
      .select(`
        *,
        roommates!inner(user_id, status),
        profiles!households_created_by_fkey(full_name, avatar_url)
      `)
      .eq('roommates.status', 'accepted')
    return { data, error }
  },

  async getRoom(householdId: string) {
    const { data, error } = await supabase
      .from('households')
      .select(`
        *,
        roommates!inner(user_id, status, profiles(full_name, avatar_url)),
        profiles!households_created_by_fkey(full_name, avatar_url)
      `)
      .eq('id', householdId)
      .single()
    return { data, error }
  },

  async createRoom(household: Omit<Room, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('households')
      .insert(household)
      .select()
      .single()
    return { data, error }
  },

  async updateRoom(householdId: string, updates: Partial<Room>) {
    const { data, error } = await supabase
      .from('households')
      .update(updates)
      .eq('id', householdId)
      .select()
      .single()
    return { data, error }
  }
}

// Roommate helpers
export const roommates = {
  async joinRoom(householdId: string, userId: string) {
    const { data, error } = await supabase
      .from('roommates')
      .insert({
        household_id: householdId,
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

  async getRoommates(householdId: string) {
    const { data, error } = await supabase
      .from('roommates')
      .select(`
        *,
        profiles(full_name, avatar_url, email)
      `)
      .eq('household_id', householdId)
      .eq('status', 'accepted')
    return { data, error }
  }
}

// Expense helpers
export const expenses = {
  async getExpenses(householdId: string) {
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
      .eq('household_id', householdId)
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
  async getMessages(householdId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq('household_id', householdId)
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

// House/User Status helpers
export const userStatus = {
  async hasHouse(userId: string) {
    const { data, error } = await supabase
      .from('roommates')
      .select('household_id, status')
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .limit(1)
    return { hasHouse: data && data.length > 0, data, error }
  },

  async getCurrentHouse(userId: string) {
    const { data, error } = await supabase
      .from('roommates')
      .select(`
        household_id,
        households(name, address, rent_amount, currency)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .single()
    return { data, error }
  }
}

// House Creation and Joining helpers
export const houses = {
  async createHouse(houseData: {
    name: string
    address: string
    rentAmount: number
    currency?: string
    createdBy: string
  }) {
    // Create the household first
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .insert({
        name: houseData.name,
        address: houseData.address,
        rent_amount: houseData.rentAmount,
        currency: houseData.currency || 'USD',
        created_by: houseData.createdBy,
        is_available: true
      })
      .select()
      .single()

    if (householdError) return { data: null, error: householdError }

    // Add the creator as a roommate
    const { data: roommateData, error: roommateError } = await supabase
      .from('roommates')
      .insert({
        household_id: householdData.id,
        user_id: houseData.createdBy,
        status: 'accepted'
      })
      .select()
      .single()

    if (roommateError) return { data: null, error: roommateError }

    return { data: { household: householdData, roommate: roommateData }, error: null }
  },

  async joinHouse(houseCode: string, userId: string) {
    // Find household by code (assuming code is stored in household name or a separate field)
    // For now, we'll search by name containing the code
    const { data: households, error: searchError } = await supabase
      .from('households')
      .select('id, name')
      .ilike('name', `%${houseCode}%`)
      .eq('is_available', true)
      .limit(1)

    if (searchError || !households || households.length === 0) {
      return { data: null, error: new Error('House not found with that code') }
    }

    const household = households[0]

    // Add user as roommate with pending status
    const { data: roommateData, error: roommateError } = await supabase
      .from('roommates')
      .insert({
        household_id: household.id,
        user_id: userId,
        status: 'pending'
      })
      .select()
      .single()

    if (roommateError) return { data: null, error: roommateError }

    return { data: { household, roommate: roommateData }, error: null }
  },

  async generateHouseCode(householdId: string) {
    // Generate a simple code (you can make this more sophisticated)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Update household with the code (you might want to add a code field to your schema)
    const { data, error } = await supabase
      .from('households')
      .update({ name: `${code} - ${householdId}` }) // Temporary solution
      .eq('id', householdId)
      .select()
      .single()

    return { data: code, error }
  }
}

// Real-time subscriptions
export const subscribeToRoom = (householdId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`household:${householdId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'messages', filter: `household_id=eq.${householdId}` },
      callback
    )
    .subscribe()
}

export const subscribeToExpenses = (householdId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`expenses:${householdId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'expenses', filter: `household_id=eq.${householdId}` },
      callback
    )
    .subscribe()
}
