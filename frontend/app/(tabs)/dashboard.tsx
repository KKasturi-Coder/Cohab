import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth, userStatus } from '@/lib/supabase-helpers';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [userName, setUserName] = useState('User');
  const [currentDate, setCurrentDate] = useState('');
  const [houseInfo, setHouseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication first
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/index');
        return;
      }
      setIsCheckingAuth(false);
      loadDashboardData();
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/index');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await auth.getCurrentUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
      }

      // Get current date
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(today.toLocaleDateString('en-US', options));

      // Get house info
      if (user) {
        const { data: houseData } = await userStatus.getCurrentHouse(user.id);
        setHouseInfo(houseData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth || loading) {
    return (
      <LinearGradient colors={['#F0F8E8', '#E8F4FD']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <ThemedText>Loading dashboard...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F0F8E8', '#E8F4FD']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton}>
            <IconSymbol name="gearshape.fill" size={24} color="#666666" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <ThemedText style={styles.logoText}>
              <ThemedText style={styles.logoGreen}>Co</ThemedText>
              <ThemedText style={styles.logoLightGreen}>hab</ThemedText>
            </ThemedText>
          </View>
          
          <TouchableOpacity style={styles.headerButton}>
            <IconSymbol name="bubble.left.and.bubble.right.fill" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <ThemedText style={styles.greeting}>
            Hey {userName} 👋
          </ThemedText>
          <ThemedText style={styles.date}>{currentDate}</ThemedText>
        </View>

        {/* Task Overview Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardRow}>
            <View style={[styles.taskCard, styles.pastDueCard]}>
              <ThemedText style={styles.cardTitle}>Past Due</ThemedText>
              <ThemedText style={styles.cardNumber}>0</ThemedText>
            </View>
            <View style={[styles.taskCard, styles.toDoCard]}>
              <ThemedText style={styles.cardTitle}>To-do</ThemedText>
              <ThemedText style={styles.cardNumber}>0</ThemedText>
            </View>
            <View style={[styles.taskCard, styles.doneCard]}>
              <ThemedText style={styles.cardTitle}>Done</ThemedText>
              <ThemedText style={styles.cardNumber}>0</ThemedText>
            </View>
          </View>
        </View>

        {/* Financial Overview Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardRow}>
            <View style={[styles.expenseCard, styles.oweCard]}>
              <ThemedText style={styles.cardTitle}>You Owe</ThemedText>
              <ThemedText style={styles.cardNumber}>$0.00</ThemedText>
            </View>
            <View style={[styles.expenseCard, styles.owedCard]}>
              <ThemedText style={styles.cardTitle}>You're Owed</ThemedText>
              <ThemedText style={styles.cardNumber}>$0.00</ThemedText>
            </View>
          </View>
        </View>

        {/* Home Details */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Home Details</ThemedText>
          <View style={styles.homeCard}>
            <View style={styles.homeIcon}>
              <IconSymbol name="house.fill" size={24} color="#7CB342" />
            </View>
            <View style={styles.homeInfo}>
              <ThemedText style={styles.homeName}>
                {houseInfo?.households?.name || 'No House Yet'}
              </ThemedText>
              <ThemedText style={styles.homeUnit}>
                {houseInfo?.households?.address || 'Join or create a house to get started'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Roomies Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Roomies</ThemedText>
          <View style={styles.householdiesContainer}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar} />
              <View style={styles.avatar} />
              <View style={styles.avatar} />
              <View style={styles.avatar} />
            </View>
            <TouchableOpacity style={styles.addButton}>
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoGreen: {
    color: '#7CB342',
  },
  logoLightGreen: {
    color: '#9ACD32',
  },
  greetingContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#666666',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pastDueCard: {
    backgroundColor: '#FFB6C1',
  },
  toDoCard: {
    backgroundColor: '#FFE4B5',
  },
  doneCard: {
    backgroundColor: '#98FB98',
  },
  expenseCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  oweCard: {
    backgroundColor: '#FFE4B5',
  },
  owedCard: {
    backgroundColor: '#ADD8E6',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  homeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F8E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  homeInfo: {
    flex: 1,
  },
  homeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  homeUnit: {
    fontSize: 14,
    color: '#666666',
  },
  householdsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: -8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#7CB342',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
