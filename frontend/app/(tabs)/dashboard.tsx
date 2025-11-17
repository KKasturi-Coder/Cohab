import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth } from '@/lib/supabase-helpers';
import { getCurrentHousehold, getMyChoreAssignments, ChoreAssignment } from '@/lib/graphql-client';
import { completeChoreAssignment } from '@/lib/graphql/mutations/chores';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { ChoreAssignmentItem } from '@/components/chores/chore-assignment-item';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('User');
  const [currentDate, setCurrentDate] = useState('');
  const [houseInfo, setHouseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
            const assignments = await getMyChoreAssignments(houseData.id, false);
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  }, [loadDashboardData]);

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
      Alert.alert('Success', 'Chore completed! 🎉');
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
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  // Group chores by status
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueChores = myChores.filter((a) => {
    if (a.isComplete) return false;
    const dueDate = new Date(a.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  const dueTodayChores = myChores.filter((a) => {
    if (a.isComplete) return false;
    const dueDate = new Date(a.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const upcomingChores = myChores.filter((a) => {
    if (a.isComplete) return false;
    const dueDate = new Date(a.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today;
  }).slice(0, 3);

  const totalPending = overdueChores.length + dueTodayChores.length + upcomingChores.length;

  return (
    <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <ThemedText style={styles.greeting}>Hey {userName} 👋</ThemedText>
              <ThemedText style={styles.date}>{currentDate}</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.7}
            >
              <IconSymbol name="gearshape.fill" size={22} color="#FFC125" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, styles.pastDueCard]}
            onPress={() => router.push('/chores/assignments?filter=overdue')}
            activeOpacity={0.8}
          >
            <View style={styles.statIconContainer}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#CD853F" />
            </View>
            <ThemedText style={styles.statNumber}>{choreStats.pastDue}</ThemedText>
            <ThemedText style={styles.statLabel}>Past Due</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.toDoCard]}
            onPress={() => router.push('/chores/assignments')}
            activeOpacity={0.8}
          >
            <View style={styles.statIconContainer}>
              <IconSymbol name="list.bullet.clipboard" size={24} color="#FFC125" />
            </View>
            <ThemedText style={styles.statNumber}>{choreStats.toDo}</ThemedText>
            <ThemedText style={styles.statLabel}>To-do</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.doneCard]}
            onPress={() => router.push('/chores/assignments')}
            activeOpacity={0.8}
          >
            <View style={styles.statIconContainer}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#FFC125" />
            </View>
            <ThemedText style={styles.statNumber}>{choreStats.done}</ThemedText>
            <ThemedText style={styles.statLabel}>Done</ThemedText>
          </TouchableOpacity>
          </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/chores/assignments')}
            activeOpacity={0.8}
          >
            <IconSymbol name="checkmark.circle" size={20} color="#FFC125" />
            <ThemedText style={styles.actionText}>My Chores</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#8B8B8B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/expenses')}
            activeOpacity={0.8}
          >
            <IconSymbol name="dollarsign.circle" size={20} color="#FFC125" />
            <ThemedText style={styles.actionText}>Expenses</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#8B8B8B" />
          </TouchableOpacity>
        </View>

        {/* My Chores Section */}
        {totalPending > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>My Tasks</ThemedText>
              <TouchableOpacity onPress={() => router.push('/chores/assignments')}>
                <ThemedText style={styles.seeAllText}>See All</ThemedText>
              </TouchableOpacity>
            </View>

            {overdueChores.length > 0 && (
              <View style={styles.choreGroup}>
                <View style={styles.groupHeader}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#CD853F" />
                  <ThemedText style={styles.groupTitle}>Overdue ({overdueChores.length})</ThemedText>
                </View>
                {overdueChores.slice(0, 2).map((assignment) => (
                  <ChoreAssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onComplete={handleCompleteChore}
                    onDelete={() => {}}
                    isOwnAssignment={true}
                  />
                ))}
              </View>
            )}

            {dueTodayChores.length > 0 && (
              <View style={styles.choreGroup}>
                <View style={styles.groupHeader}>
                  <IconSymbol name="bell.fill" size={16} color="#D4AF37" />
                  <ThemedText style={styles.groupTitle}>Due Today ({dueTodayChores.length})</ThemedText>
                </View>
                {dueTodayChores.slice(0, 2).map((assignment) => (
                  <ChoreAssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onComplete={handleCompleteChore}
                    onDelete={() => {}}
                    isOwnAssignment={true}
                  />
                ))}
              </View>
            )}

            {upcomingChores.length > 0 && (
              <View style={styles.choreGroup}>
                <View style={styles.groupHeader}>
                  <IconSymbol name="calendar" size={16} color="#FFC125" />
                  <ThemedText style={styles.groupTitle}>Upcoming</ThemedText>
                </View>
                {upcomingChores.map((assignment) => (
                <ChoreAssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                  onComplete={handleCompleteChore}
                    onDelete={() => {}}
                  isOwnAssignment={true}
                />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyChoresSection}>
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle" size={64} color="#8B8B8B" />
              <ThemedText style={styles.emptyStateText}>All caught up! 🎉</ThemedText>
              <ThemedText style={styles.emptyStateHint}>
                You don't have any pending tasks right now
              </ThemedText>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/chores/all')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.emptyStateButtonText}>Browse Chores</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Financial Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Expenses</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.expenseCards}>
            <TouchableOpacity
              style={[styles.expenseCard, styles.oweCard]}
              onPress={() => router.push('/(tabs)/expenses')}
              activeOpacity={0.8}
            >
              <View style={styles.expenseCardHeader}>
                <IconSymbol name="arrow.down.circle.fill" size={24} color="#CD853F" />
                <ThemedText style={styles.expenseCardTitle}>You Owe</ThemedText>
            </View>
              <ThemedText style={styles.expenseCardAmount}>$0.00</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.expenseCard, styles.owedCard]}
              onPress={() => router.push('/(tabs)/expenses')}
              activeOpacity={0.8}
            >
              <View style={styles.expenseCardHeader}>
                <IconSymbol name="arrow.up.circle.fill" size={24} color="#FFC125" />
                <ThemedText style={styles.expenseCardTitle}>You're Owed</ThemedText>
            </View>
              <ThemedText style={styles.expenseCardAmount}>$0.00</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#D4AF37',
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFC125',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 193, 37, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  pastDueCard: {
    borderColor: 'rgba(205, 133, 63, 0.4)',
  },
  toDoCard: {
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  doneCard: {
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 193, 37, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFC125',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC125',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFC125',
  },
  seeAllText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  choreGroup: {
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC125',
  },
  emptyChoresSection: {
    marginBottom: 24,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#8B8B8B',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#FFC125',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  expenseCards: {
    flexDirection: 'row',
    gap: 12,
  },
  expenseCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  oweCard: {
    borderColor: 'rgba(205, 133, 63, 0.4)',
  },
  owedCard: {
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  expenseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  expenseCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  expenseCardAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFC125',
  },
});
