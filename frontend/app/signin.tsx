import { Session } from '@supabase/supabase-js'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import Account from '../components/account/account'
import Auth from '../components/auth/auth'
import { supabase } from '../lib/supabase'
import { userStatus } from '../lib/supabase-helpers'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isCheckingHouse, setIsCheckingHouse] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        checkUserHouseStatus(session.user.id)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        checkUserHouseStatus(session.user.id)
      }
    })
  }, [])

  const checkUserHouseStatus = async (userId: string) => {
    setIsCheckingHouse(true)
    try {
      const { hasHouse } = await userStatus.hasHouse(userId)
      
      if (hasHouse) {
        // User has a house, go to dashboard
        router.replace('/(tabs)/dashboard')
      } else {
        // User doesn't have a house, go to join house screen
        router.replace('/join-house')
      }
    } catch (error) {
      console.error('Error checking house status:', error)
      // If error, still show account page
    } finally {
      setIsCheckingHouse(false)
    }
  }

  return (
    <View>
      {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
    </View>
  )
}