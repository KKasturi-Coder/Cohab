import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { getCurrentHousehold } from '@/lib/graphql-client';
import { getHouseholdChoreAssignments, getMyChoreAssignments } from '@/lib/graphql/queries/chores';
import { supabase } from '@/lib/supabase';
import { Household, ChoreAssignment } from '@/lib/graphql/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth } from '@/lib/supabase-helpers';

export default function ChoresScreen() {
  const insets = useSafeAreaInsets();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    myPending: 0,
    myCompleted: 0,
    totalChores: 0,
    overdue: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<ChoreAssignment[]>([]);

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
          await loadChoreData(houseData.id);
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

  const loadChoreData = async (householdId: string) => {
    try {
      const user = await auth.getCurrentUser();
      if (!user) return;

      const [myAssignments, allAssignments] = await Promise.all([
        getMyChoreAssignments(householdId, false, 50),
        getHouseholdChoreAssignments(householdId, false, 50),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const myPending = myAssignments.filter(a => !a.isComplete).length;
      const myCompleted = myAssignments.filter(a => a.isComplete).length;
      const overdue = allAssignments.filter(a => {
        if (a.isComplete) return false;
        const dueDate = new Date(a.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length;

      setStats({
        myPending,
        myCompleted,
        totalChores: allAssignments.length,
        overdue,
      });

      // Get recent pending assignments (up to 3)
      const recent = myAssignments
        .filter(a => !a.isComplete)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3);
      setRecentAssignments(recent);
    } catch (error) {
      console.error('Error loading chore data:', error);
    }
  };

  if (isCheckingAuth || loading) {
    return (
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC125" />
          <ThemedText style={styles.loadingText}>Loading chores...</ThemedText>
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
    <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Chores</ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/chores/create')}
          >
            <IconSymbol name="plus" size={20} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/chores/assignments')}
            activeOpacity={0.8}
          >
            <View style={styles.statIconContainer}>
              <IconSymbol name="list.bullet.clipboard" size={24} color="#FFC125" />
            </View>
            <ThemedText style={styles.statNumber}>{stats.myPending}</ThemedText>
            <ThemedText style={styles.statLabel}>My Tasks</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/chores/all')}
            activeOpacity={0.8}
          >
            <View style={styles.statIconContainer}>
              <IconSymbol name="house.fill" size={24} color="#FFC125" />
            </View>
            <ThemedText style={styles.statNumber}>{stats.totalChores}</ThemedText>
            <ThemedText style={styles.statLabel}>All Chores</ThemedText>
          </TouchableOpacity>

          {stats.overdue > 0 && (
            <TouchableOpacity
              style={[styles.statCard, styles.overdueCard]}
              onPress={() => router.push('/chores/assignments?filter=overdue')}
              activeOpacity={0.8}
            >
              <View style={styles.statIconContainer}>
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#CD853F" />
              </View>
              <ThemedText style={[styles.statNumber, styles.overdueNumber]}>
                {stats.overdue}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Overdue</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/chores/assignments')}
            activeOpacity={0.8}
          >
            <IconSymbol name="checkmark.circle" size={20} color="#FFC125" />
            <ThemedText style={styles.actionText}>My Assignments</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#8B8B8B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/chores/all')}
            activeOpacity={0.8}
          >
            <IconSymbol name="list.bullet" size={20} color="#FFC125" />
            <ThemedText style={styles.actionText}>All Chores</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#8B8B8B" />
          </TouchableOpacity>
        </View>

        {/* Recent Tasks */}
        {recentAssignments.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Upcoming Tasks</ThemedText>
              <TouchableOpacity onPress={() => router.push('/chores/assignments')}>
                <ThemedText style={styles.seeAllText}>See All</ThemedText>
              </TouchableOpacity>
            </View>
            {recentAssignments.map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dueDateOnly = new Date(dueDate);
              dueDateOnly.setHours(0, 0, 0, 0);
              const isOverdue = dueDateOnly < today;
              const isDueToday = dueDateOnly.getTime() === today.getTime();

              return (
                <TouchableOpacity
                  key={assignment.id}
                  style={styles.recentItem}
                  onPress={() => router.push('/chores/assignments')}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentItemContent}>
                    <ThemedText style={styles.recentItemTitle} numberOfLines={1}>
                      {assignment.chore.title}
                    </ThemedText>
                    <ThemedText style={styles.recentItemDate}>
                      {isOverdue
                        ? 'Overdue'
                        : isDueToday
                        ? 'Due Today'
                        : dueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                    </ThemedText>
                  </View>
                  <View style={styles.recentItemBadge}>
                    <ThemedText style={styles.recentItemPoints}>
                      ⭐ {assignment.chore.points}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFC125',
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFC125',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFC125',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
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
  overdueCard: {
    borderColor: 'rgba(205, 133, 63, 0.4)',
    backgroundColor: '#0F172A',
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
  overdueNumber: {
    color: '#CD853F',
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
  recentSection: {
    marginTop: 8,
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
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC125',
    marginBottom: 4,
  },
  recentItemDate: {
    fontSize: 13,
    color: '#D4AF37',
  },
  recentItemBadge: {
    backgroundColor: 'rgba(255, 193, 37, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
  },
  recentItemPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFC125',
  },
});
