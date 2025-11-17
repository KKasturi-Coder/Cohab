import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ChoreAssignment } from '@/lib/graphql/types';
import { getMyChoreAssignments, getHouseholdChoreAssignments } from '@/lib/graphql/queries/chores';
import { completeChoreAssignment, deleteChoreAssignment } from '@/lib/graphql/mutations/chores';
import { ChoreAssignmentItem } from '@/components/chores/chore-assignment-item';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth } from '@/lib/supabase-helpers';
import { getCurrentHousehold } from '@/lib/graphql-client';
import { supabase } from '@/lib/supabase';

export default function AssignmentsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const filter = params.filter as string | undefined;

  const [assignments, setAssignments] = useState<ChoreAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = await auth.getCurrentUser();
      if (!user) {
        router.replace('/');
        return;
      }
      setCurrentUserId(user.id);

      const household = await getCurrentHousehold();
      if (!household) {
        router.replace('/');
        return;
      }
      setHouseholdId(household.id);

      const data = await getMyChoreAssignments(household.id, false, 100);
      let filtered = data;

      // Apply filter if specified
      if (filter === 'overdue') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = data.filter((a) => {
          if (a.isComplete) return false;
          const dueDate = new Date(a.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today;
        });
      }

      // Sort by due date (earliest first)
      filtered.sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      });

      setAssignments(filtered);
    } catch (error) {
      console.error('Error loading assignments:', error);
      Alert.alert('Error', 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleComplete = async (assignmentId: string, proofUrl?: string) => {
    try {
      await completeChoreAssignment({ assignmentId, proofUrl });
      Alert.alert('Success', 'Chore completed! 🎉');
      loadData();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete chore');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    try {
      await deleteChoreAssignment(assignmentId);
      Alert.alert('Success', 'Assignment removed');
      loadData();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove assignment');
    }
  };

  // Group assignments by status
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = assignments.filter((a) => {
    if (a.isComplete) return false;
    const dueDate = new Date(a.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  const dueToday = assignments.filter((a) => {
    if (a.isComplete) return false;
    const dueDate = new Date(a.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const upcoming = assignments.filter((a) => {
    if (a.isComplete) return false;
    const dueDate = new Date(a.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today;
  });

  const completed = assignments.filter((a) => a.isComplete);

  return (
    <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.left" size={24} color="#FFC125" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Assignments</ThemedText>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC125" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {assignments.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle" size={64} color="#8B8B8B" />
              <ThemedText style={styles.emptyStateText}>No assignments yet</ThemedText>
              <ThemedText style={styles.emptyStateHint}>
                Create chores and assign them to get started
              </ThemedText>
            </View>
          ) : (
            <>
              {overdue.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#CD853F" />
                    <ThemedText style={styles.sectionTitle}>Overdue ({overdue.length})</ThemedText>
                  </View>
                  {overdue.map((assignment) => (
                    <ChoreAssignmentItem
                      key={assignment.id}
                      assignment={assignment}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      isOwnAssignment={true}
                    />
                  ))}
                </View>
              )}

              {dueToday.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol name="bell.fill" size={20} color="#D4AF37" />
                    <ThemedText style={styles.sectionTitle}>Due Today ({dueToday.length})</ThemedText>
                  </View>
                  {dueToday.map((assignment) => (
                    <ChoreAssignmentItem
                      key={assignment.id}
                      assignment={assignment}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      isOwnAssignment={true}
                    />
                  ))}
                </View>
              )}

              {upcoming.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol name="calendar" size={20} color="#FFC125" />
                    <ThemedText style={styles.sectionTitle}>Upcoming ({upcoming.length})</ThemedText>
                  </View>
                  {upcoming.map((assignment) => (
                    <ChoreAssignmentItem
                      key={assignment.id}
                      assignment={assignment}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      isOwnAssignment={true}
                    />
                  ))}
                </View>
              )}

              {completed.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol name="checkmark.circle.fill" size={20} color="#FFC125" />
                    <ThemedText style={styles.sectionTitle}>Completed ({completed.length})</ThemedText>
                  </View>
                  {completed.map((assignment) => (
                    <ChoreAssignmentItem
                      key={assignment.id}
                      assignment={assignment}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      isOwnAssignment={true}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 193, 37, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFC125',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFC125',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
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
    maxWidth: 300,
  },
});

