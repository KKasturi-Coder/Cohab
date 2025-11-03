import { Session } from '@supabase/supabase-js'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import Account from '../components/account/account'
import Auth from '../components/auth/auth'
import { supabase } from '../lib/supabase'
import { hasHousehold } from '../lib/graphql-client'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/themed-text'

const { height } = Dimensions.get('window')

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isCheckingHouse, setIsCheckingHouse] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      // Check house status on initial load if already signed in
      if (session?.user) {
        console.log('Initial session found, checking house status...')
        checkUserHouseStatus(session.user.id)
      }
    })

    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      setSession(session)
      // Check house status after sign in
      if (session?.user && event === 'SIGNED_IN') {
        console.log('User signed in, checking house status...')
        checkUserHouseStatus(session.user.id)
      }
    })
  }, [])

  const checkUserHouseStatus = async (userId: string) => {
    setIsCheckingHouse(true)
    console.log('Checking house status for user:', userId)
    try {
      const hasHouse = await hasHousehold()
      console.log('Has household:', hasHouse)
      
      if (hasHouse) {
        // User has a house, go to dashboard
        console.log('Redirecting to dashboard')
        router.replace('/(tabs)/dashboard')
      } else {
        // User doesn't have a house, go to join house screen
        console.log('No household found, redirecting to join-house')
        router.replace('/join-house')
      }
    } catch (error) {
      console.error('Error checking house status:', error)
      // If error, redirect to join-house to let them set up
      console.log('Error occurred, redirecting to join-house')
      router.replace('/join-house')
    } finally {
      setIsCheckingHouse(false)
    }
  }

  if (isCheckingHouse) {
    return (
      <LinearGradient
        colors={['#F0F8E8', '#E8F4FD']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#F0F8E8', '#E8F4FD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {session && session.user ? (
          <Account key={session.user.id} session={session} />
        ) : (
          <View style={styles.authContainer}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>Welcome Back!</ThemedText>
              <ThemedText style={styles.subtitle}>
                Sign in to manage your shared living space.
              </ThemedText>
            </View>
            <Auth mode="signin" />
          </View>
        )}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  authContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
})