import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth } from '@/lib/supabase-helpers';
import { getCurrentHousehold, getMyChoreAssignments, ChoreAssignment } from '@/lib/graphql-client';
import { completeChoreAssignment } from '@/lib/graphql/mutations/chores';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { ChoreAssignmentItem } from '@/components/chores/chore-assignment-item';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [userName, setUserName] = useState('User');
  const [currentDate, setCurrentDate] = useState('');
  const [houseInfo, setHouseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [myChores, setMyChores] = useState<ChoreAssignment[]>([]);
  const [choreStats, setChoreStats] = useState({ pastDue: 0, toDo: 0, done: 0 });

  const loadDashboardData = useCallback(async () => {
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
        const houseData = await getCurrentHousehold();
        setHouseInfo(houseData);

        // Get user's chore assignments if they have a household
        if (houseData?.id) {
          try {
            const assignments = await getMyChoreAssignments(houseData.id, true);
            setMyChores(assignments);

            // Calculate chore statistics
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const stats = assignments.reduce((acc, assignment) => {
              if (assignment.isComplete) {
                acc.done++;
              } else {
                const dueDate = new Date(assignment.dueDate);
                const dueDateDay = new Date(dueDate);
                dueDateDay.setHours(0, 0, 0, 0);
                if (dueDateDay.getTime() < today.getTime()) {
                  acc.pastDue++;
                } else {
                  acc.toDo++;
                }
              }
              return acc;
            }, { pastDue: 0, toDo: 0, done: 0 });
            
            setChoreStats(stats);
          } catch (error) {
            console.error('Error fetching chores:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication first
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setIsCheckingAuth(false);
      loadDashboardData();
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadDashboardData]);

  const handleCompleteChore = async (assignmentId: string) => {
    try {
      await completeChoreAssignment({ assignmentId });
      // Refresh the dashboard data to show updated chore status
      await loadDashboardData();
    } catch (error) {
      console.error('Error completing chore:', error);
      Alert.alert('Error', 'Failed to mark chore as complete. Please try again.');
    }
  };


  if (isCheckingAuth || loading) {
    return (
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC125" />
          <ThemedText>Loading dashboard...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky Header */}
        <View style={styles.stickyHeader}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton}>
              <IconSymbol name="gearshape.fill" size={24} color="#FFC125" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <ThemedText style={styles.logoText}>
                <ThemedText style={styles.logoGold}>Co</ThemedText>
                <ThemedText style={styles.logoDarkBlue}>hab</ThemedText>
              </ThemedText>
            </View>
            
            <TouchableOpacity style={styles.headerButton}>
              <IconSymbol name="bubble.left.and.bubble.right.fill" size={24} color="#FFC125" />
            </TouchableOpacity>
          </View>
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
              <ThemedText style={styles.cardNumber}>{choreStats.pastDue}</ThemedText>
            </View>
            <View style={[styles.taskCard, styles.toDoCard]}>
              <ThemedText style={styles.cardTitle}>To-do</ThemedText>
              <ThemedText style={styles.cardNumber}>{choreStats.toDo}</ThemedText>
            </View>
            <View style={[styles.taskCard, styles.doneCard]}>
              <ThemedText style={styles.cardTitle}>Done</ThemedText>
              <ThemedText style={styles.cardNumber}>{choreStats.done}</ThemedText>
            </View>
          </View>
        </View>

        {/* My Chores Section */}
        {myChores.length > 0 && (
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>My Chores</ThemedText>
            {myChores.filter(c => !c.isComplete).slice(0, 5).map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const now = new Date();
              const diffMs = dueDate.getTime() - now.getTime();
              const isPast = diffMs < 0;
              const absDiffMs = Math.abs(diffMs);
              
              // Convert to various time units
              const minutes = Math.floor(absDiffMs / (1000 * 60));
              const hours = Math.floor(minutes / 60);
              const days = Math.floor(hours / 24);
              const months = Math.floor(days / 30);
              const years = Math.floor(months / 12);
              
              // Determine the most appropriate unit to display
              let relativeTime = '';
              if (years > 0) {
                relativeTime = `${years}y`;
              } else if (months > 0) {
                relativeTime = `${months}mo`;
              } else if (days > 0) {
                relativeTime = `${days}d`;
              } else if (hours > 0) {
                relativeTime = `${hours}h`;
              } else if (minutes > 0) {
                relativeTime = `${minutes}m`;
              } else {
                relativeTime = 'now';
              }
              
              // For dates in the future, show "in X" format, for past show "X ago"
              const timeString = isPast ? `${relativeTime} ago` : `in ${relativeTime}`;
              
              // For dates within the same day, show time, otherwise show date
              const isSameDay = dueDate.toDateString() === now.toDateString();
              const timeFormat = isSameDay 
                ? { hour: 'numeric', minute: '2-digit' }
                : { month: 'short', day: 'numeric' };
              
              const formattedDate = isSameDay 
                ? dueDate.toLocaleTimeString('en-US', timeFormat as any)
                : dueDate.toLocaleDateString('en-US', timeFormat as any);
                
              // For the status calculation (keep using date-only comparison)
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dueDateOnly = new Date(dueDate);
              dueDateOnly.setHours(0, 0, 0, 0);
              const isPastDue = dueDateOnly < today;
              const isDueToday = dueDateOnly.getTime() === today.getTime();
              
              // Determine the status and colors
              let status = 'upcoming';
              let iconColor = '#FFC125'; // Rich gold for upcoming
              let iconName = assignment.chore.requiresProof ? "camera.fill" : "checkmark.circle.fill";
              
              if (isPastDue) {
                status = 'overdue';
                iconColor = '#CD853F'; // Perennial gold for overdue
                iconName = 'exclamationmark.triangle';
              } else if (isDueToday) {
                status = 'dueToday';
                iconColor = '#D4AF37'; // Metallic gold for due today
                iconName = 'bell';
              }
              
              return (
                <ChoreAssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                  onComplete={handleCompleteChore}
                  onDelete={() => {}} // Not used in dashboard
                  isOwnAssignment={true}
                />
              );
            })}
          </View>
        )}

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
        {/* Bottom padding for last item */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: '#000000',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 193, 37, 0.3)',
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 14,
    shadowColor: '#FFC125',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoGold: {
    color: '#FFC125',
    fontWeight: '800',
  },
  logoDarkBlue: {
    color: '#1E3A8A',
    fontWeight: '800',
  },
  greetingContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#D4AF37',
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
    backgroundColor: '#CD853F',
  },
  toDoCard: {
    backgroundColor: '#D4AF37',
  },
  doneCard: {
    backgroundColor: '#FFC125',
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
    backgroundColor: '#1E3A8A',
  },
  owedCard: {
    backgroundColor: '#1E40AF',
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
    color: '#FFC125',
    marginBottom: 12,
  },
  choreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  choreIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  choreTodoIcon: {
    backgroundColor: '#F0F8E8',
  },
  chorePastDueIcon: {
    backgroundColor: '#FFE8E8',
  },
  choreDueTodayIcon: {
    backgroundColor: '#FFF3E0',
  },
  choreInfo: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  choreDueDate: {
    fontSize: 14,
    color: '#666666',
  },
  choreDueDateOverdue: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  choreDueDateDueToday: {
    color: '#FF9500',
    fontWeight: '500',
  },
  chorePoints: {
    backgroundColor: '#7CB342',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chorePointsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
