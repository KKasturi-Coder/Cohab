import { Input } from '@rneui/themed'
import React, { useState } from 'react'
import { Alert, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../lib/supabase'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

interface AuthProps {
  mode: 'signin' | 'signup'
}

export default function Auth({ mode }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const isSignIn = mode === 'signin'

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (!email || !password) Alert.alert('Please enter an email and password')
    else if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (!email || !password) Alert.alert('Please enter an email and password.')
    else if (error) Alert.alert(error.message)
    else if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Input
          label="Email"
          labelStyle={styles.label}
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: emailFocused ? '#000000' : '#666666', size: 20 }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
          inputContainerStyle={[styles.inputField, emailFocused && styles.inputFieldFocused]}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.inputText}
          placeholderTextColor="#999999"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Input
          label="Password"
          labelStyle={styles.label}
          leftIcon={{ type: 'font-awesome', name: 'lock', color: passwordFocused ? '#000000' : '#666666', size: 20 }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          inputContainerStyle={[styles.inputField, passwordFocused && styles.inputFieldFocused]}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.inputText}
          placeholderTextColor="#999999"
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]} 
        onPress={isSignIn ? signInWithEmail : signUpWithEmail}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading 
            ? (isSignIn ? 'Signing in...' : 'Signing up...') 
            : (isSignIn ? 'Sign In' : 'Sign Up')
          }
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  label: {
    color: '#2C2C2C',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  inputFieldFocused: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  inputText: {
    color: '#2C2C2C',
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#000000',
    marginTop: 24,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000000',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})