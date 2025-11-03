import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ChoresManager } from '@/components/chores/chores-manager';
import { getCurrentHousehold } from '@/lib/graphql-client';
import { supabase } from '@/lib/supabase';
import { Household } from '@/lib/graphql/types';

export default function ChoresScreen() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setIsCheckingAuth(false);

      // Load household data
      try {
        const houseData = await getCurrentHousehold();
        if (houseData) {
          setHousehold(houseData);
        }
      } catch (error) {
        console.error('Error loading household:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isCheckingAuth || loading) {
    return (
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC125" />
          <ThemedText>Loading chores...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  if (!household) {
    return (
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.errorText}>No household found</ThemedText>
          <ThemedText style={styles.errorSubtext}>
            Please join or create a household to manage chores
          </ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <ChoresManager 
      householdId={household.id} 
      roommates={household.roommates || []} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFC125',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#D4AF37',
    textAlign: 'center',
  },
});

