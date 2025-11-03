import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { ActivityIndicator } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // User is logged in, redirect to dashboard
        router.replace('/(tabs)/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace('/(tabs)/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    router.push('/signup');
  };

  if (isCheckingAuth) {
    return (
      <LinearGradient
        colors={['#F0F8E8', '#E8F4FD']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F0F8E8', '#E8F4FD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Main Content */}
      <View style={styles.content}>
        {/* Illustration Placeholder */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            {/* Central Figure (properly centered) */}
            <View style={styles.figure}>
              <View style={styles.head} />
              <View style={styles.body} />
              <View style={styles.laptop} />
              <View style={styles.mug} />
            </View>

            {/* Decorative Elements */}
            <View style={styles.vase} />
            <View style={styles.coffeeCup} />
            <View style={styles.serverStack} />
            <View style={styles.stopwatch} />
            <View style={styles.pieChart} />
            <View style={styles.calendar} />

            {/* Scattered Dots */}
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
            <View style={[styles.dot, styles.dot4]} />
            <View style={[styles.dot, styles.dot5]} />
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <ThemedText type="title" style={styles.welcomeTitle}>Welcome to Cohab!</ThemedText>
          <ThemedText style={styles.welcomeDescription}>
            The all-in-one shared living manager designed to eliminate all friction between roommates.
          </ThemedText>
        </View>
      </View>

      {/* Get Started Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted} activeOpacity={0.8}>
          <ThemedText style={styles.buttonText}>Get Started</ThemedText>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  illustrationContainer: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
    position: 'relative',
  },
  illustration: { flex: 1, position: 'relative' },

  // Central Figure — fill parent and center contents
  figure: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    marginBottom: 10,
  },
  body: {
    width: 60,
    height: 80,
    backgroundColor: '#FFB6C1',
    borderRadius: 30,
    marginBottom: 10,
  },
  laptop: {
    width: 80,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    position: 'absolute',
    top: 60,
  },
  mug: {
    width: 20,
    height: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    position: 'absolute',
    top: 20,
    right: -15,
  },

  // Decorative Elements
  vase: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: 30,
    height: 40,
    backgroundColor: '#87CEEB',
    borderRadius: 15,
  },
  coffeeCup: {
    position: 'absolute',
    top: '35%',
    left: '5%',
    width: 20,
    height: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  serverStack: {
    position: 'absolute',
    top: '40%',
    right: '15%',
    width: 25,
    height: 60,
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
  },
  stopwatch: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: 25,
    height: 25,
    backgroundColor: '#87CEEB',
    borderRadius: 12.5,
  },
  pieChart: {
    position: 'absolute',
    top: '25%',
    left: '5%',
    width: 20,
    height: 20,
    backgroundColor: '#FFB6C1',
    borderRadius: 10,
  },
  calendar: {
    position: 'absolute',
    top: '15%',
    right: '25%',
    width: 25,
    height: 25,
    backgroundColor: '#87CEEB',
    borderRadius: 5,
  },

  // Scattered Dots
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  dot1: { top: '10%', left: '30%', backgroundColor: '#FFB6C1' },
  dot2: { top: '60%', left: '5%', backgroundColor: '#9370DB' },
  dot3: { top: '70%', right: '20%', backgroundColor: '#87CEEB' },
  dot4: { top: '20%', right: '10%', backgroundColor: '#FFD700' },
  dot5: { top: '80%', left: '25%', backgroundColor: '#98FB98' },

  textContainer: { alignItems: 'center', paddingHorizontal: 20 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C2C2C', marginBottom: 16, textAlign: 'center' },
  welcomeDescription: { fontSize: 16, color: '#666666', textAlign: 'center', lineHeight: 24 },

  buttonContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  getStartedButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

