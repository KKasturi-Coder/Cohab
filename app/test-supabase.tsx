import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { Alert, Button, StyleSheet, Text, View } from 'react-native'

export default function TestSupabase() {
  const [status, setStatus] = useState('Ready to test')
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setStatus('Testing connection...')
    
    try {
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('*').limit(1)
      
      if (error) {
        throw error
      }
      
      setStatus('✅ Supabase connection successful!')
      Alert.alert('Success', 'Supabase connection is working perfectly!')
      
    } catch (error: any) {
      setStatus(`❌ Connection failed: ${error.message}`)
      Alert.alert('Error', `Connection failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testAuth = async () => {
    setIsLoading(true)
    setStatus('Testing authentication...')
    
    try {
      // Test auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setStatus(`✅ Auth working! User: ${user.email}`)
      } else {
        setStatus('ℹ️ No user logged in (this is normal)')
      }
      
    } catch (error: any) {
      setStatus(`❌ Auth test failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <Text style={styles.status}>{status}</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? "Testing..." : "Test Connection"}
          onPress={testConnection}
          disabled={isLoading}
        />
        
        <Button
          title="Test Auth"
          onPress={testAuth}
          disabled={isLoading}
        />
      </View>
      
      <Text style={styles.info}>
        If the connection test passes, your Supabase setup is working correctly!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
})
