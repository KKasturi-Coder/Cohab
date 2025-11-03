import { ThemedText } from '@/components/themed-text'
import { Session } from '@supabase/supabase-js'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Account from '../components/account/account'
import Auth from '../components/auth/auth'
import { supabase } from '../lib/supabase'
import { userStatus } from '../lib/supabase-helpers'

const { height } = Dimensions.get('window')

export default function SignUpScreen() {
  const [session, setSession] = useState<Session | null>(null)
  const [isCheckingHouse, setIsCheckingHouse] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      // Don't auto-check house status on initial load
    })

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      // Check house status after signin (signup also triggers SIGNED_IN event)
      if (session?.user && event === 'SIGNED_IN') {
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
      // If error, redirect to join-house to let them set up
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
              <ThemedText type="title" style={styles.title}>Join Cohab!</ThemedText>
              <ThemedText style={styles.subtitle}>
                Create your account and start managing your shared living space.
              </ThemedText>
            </View>
            <Auth mode="signup" />
            <TouchableOpacity 
              style={styles.linkContainer}
              onPress={() => router.push('/signin')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
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
  linkContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#666666',
  },
  linkTextBold: {
    fontWeight: '600',
    color: '#000000',
  },
})
