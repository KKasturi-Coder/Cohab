import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chore, ChoreAssignment, Roommate } from '@/lib/graphql/types';
import { getHouseholdChores, getHouseholdChoreAssignments } from '@/lib/graphql/queries/chores';
import {
  createChore,
  updateChore,
  deleteChore,
  createChoreAssignment,
  completeChoreAssignment,
  deleteChoreAssignment,
} from '@/lib/graphql/mutations/chores';
import { ChoreFormModal } from './chore-form-modal';
import { ChoreListItem } from './chore-list-item';
import { AssignChoreModal } from './assign-chore-modal';
import { ChoreAssignmentItem } from './chore-assignment-item';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth } from '@/lib/supabase-helpers';

interface ChoresManagerProps {
  householdId: string;
  roommates: Roommate[];
}

type TabType = 'chores' | 'assignments';

export function ChoresManager({ householdId, roommates }: ChoresManagerProps) {
  const insets = useSafeAreaInsets();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('assignments');
  const [chores, setChores] = useState<Chore[]>([]);
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isChoreFormVisible, setIsChoreFormVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [assigningChore, setAssigningChore] = useState<Chore | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [choresData, assignmentsData] = await Promise.all([
        getHouseholdChores(householdId),
        getHouseholdChoreAssignments(householdId, false),
      ]);
      setChores(choresData);
      setAssignments(assignmentsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load chores');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [householdId]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await auth.getCurrentUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
    loadData();
  }, [loadData]);

  // Chore CRUD handlers
  const handleCreateChore = async (data: any) => {
    await createChore(data);
    Alert.alert('Success', 'Chore created successfully');
    loadData();
  };

  const handleUpdateChore = async (data: any) => {
    if (!editingChore) return;
    await updateChore(editingChore.id, data);
    Alert.alert('Success', 'Chore updated successfully');
    setEditingChore(null);
    loadData();
  };

  const handleDeleteChore = async (choreId: string) => {
    try {
      await deleteChore(choreId);
      Alert.alert('Success', 'Chore deleted successfully');
      loadData();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete chore');
    }
  };

  const handleEditChore = (chore: Chore) => {
    setEditingChore(chore);
    setIsChoreFormVisible(true);
  };

  const handleAssignChore = (chore: Chore) => {
    setAssigningChore(chore);
    setIsAssignModalVisible(true);
  };

  const handleCreateAssignment = async (data: any) => {
    await createChoreAssignment(data);
    Alert.alert('Success', 'Chore assigned successfully');
    setAssigningChore(null);
    loadData();
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    try {
      await completeChoreAssignment({ assignmentId });
      Alert.alert('Success', 'Chore completed! 🎉');
      loadData();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete chore');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await deleteChoreAssignment(assignmentId);
      Alert.alert('Success', 'Assignment removed');
      loadData();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove assignment');
    }
  };

  const handleCloseChoreForm = () => {
    setIsChoreFormVisible(false);
    setEditingChore(null);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalVisible(false);
    setAssigningChore(null);
  };

  const myAssignments = assignments.filter((a) => a.user.id === currentUserId);
  const othersAssignments = assignments.filter((a) => a.user.id !== currentUserId);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={[styles.tabs, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assignments' && styles.tabActive]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.tabTextActive]}>
            Assignments ({assignments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chores' && styles.tabActive]}
          onPress={() => setActiveTab('chores')}
        >
          <Text style={[styles.tabText, activeTab === 'chores' && styles.tabTextActive]}>
            All Chores ({chores.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC125" />
          </View>
        ) : activeTab === 'assignments' ? (
          <View style={styles.assignmentsContent}>
            {myAssignments.length > 0 && (
              <View style={styles.assignmentSection}>
                <Text style={styles.sectionTitle}>My Tasks ({myAssignments.length})</Text>
                {myAssignments.map((assignment) => (
                  <ChoreAssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onComplete={handleCompleteAssignment}
                    onDelete={handleDeleteAssignment}
                    isOwnAssignment={true}
                  />
                ))}
              </View>
            )}

            {othersAssignments.length > 0 && (
              <View style={styles.assignmentSection}>
                <Text style={styles.sectionTitle}>Other Roommates ({othersAssignments.length})</Text>
                {othersAssignments.map((assignment) => (
                  <ChoreAssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onComplete={handleCompleteAssignment}
                    onDelete={handleDeleteAssignment}
                    isOwnAssignment={false}
                  />
                ))}
              </View>
            )}

            {assignments.length === 0 && (
              <View style={styles.emptyState}>
                <IconSymbol name="checkmark.circle" size={64} color="#8B8B8B" />
                <Text style={styles.emptyStateText}>No chore assignments yet</Text>
                <Text style={styles.emptyStateHint}>
                  Create chores and assign them to roommates to get started
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.choresContent}>
            {chores.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="list.bullet.clipboard" size={64} color="#8B8B8B" />
                <Text style={styles.emptyStateText}>No chores created yet</Text>
                <Text style={styles.emptyStateHint}>
                  Tap the + button below to create your first chore
                </Text>
              </View>
            ) : (
              chores.map((chore) => (
                <ChoreListItem
                  key={chore.id}
                  chore={chore}
                  onEdit={handleEditChore}
                  onDelete={handleDeleteChore}
                  onAssign={handleAssignChore}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Chore Button */}
      {activeTab === 'chores' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setEditingChore(null);
            setIsChoreFormVisible(true);
          }}
        >
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Modals */}
      <ChoreFormModal
        visible={isChoreFormVisible}
        onClose={handleCloseChoreForm}
        onSubmit={editingChore ? handleUpdateChore : handleCreateChore}
        chore={editingChore}
        householdId={householdId}
      />

      <AssignChoreModal
        visible={isAssignModalVisible}
        onClose={handleCloseAssignModal}
        onSubmit={handleCreateAssignment}
        chore={assigningChore}
        roommates={roommates}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 193, 37, 0.3)',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FFC125',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B8B8B',
  },
  tabTextActive: {
    color: '#FFC125',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  assignmentsContent: {
    padding: 16,
  },
  choresContent: {
    padding: 16,
  },
  assignmentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFC125',
    marginBottom: 12,
    textShadowColor: 'rgba(255, 193, 37, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFC125',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFC125',
  },
});
