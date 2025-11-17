import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Chore } from '@/lib/graphql/types';
import { getHouseholdChores } from '@/lib/graphql/queries/chores';
import { deleteChore } from '@/lib/graphql/mutations/chores';
import { ChoreListItem } from '@/components/chores/chore-list-item';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCurrentHousehold } from '@/lib/graphql-client';
import { Alert } from 'react-native';

export default function AllChoresScreen() {
  const insets = useSafeAreaInsets();
  const [chores, setChores] = useState<Chore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const household = await getCurrentHousehold();
      if (!household) {
        router.replace('/');
        return;
      }
      setHouseholdId(household.id);

      const data = await getHouseholdChores(household.id, 100);
      // Sort by creation date (newest first)
      data.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setChores(data);
    } catch (error) {
      console.error('Error loading chores:', error);
      Alert.alert('Error', 'Failed to load chores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (chore: Chore) => {
    router.push({
      pathname: '/chores/edit',
      params: { choreId: chore.id },
    });
  };

  const handleDelete = async (choreId: string) => {
    try {
      await deleteChore(choreId);
      Alert.alert('Success', 'Chore deleted successfully');
      loadData();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete chore');
    }
  };

  const handleAssign = (chore: Chore) => {
    router.push({
      pathname: '/chores/assign',
      params: { choreId: chore.id },
    });
  };

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
        <ThemedText style={styles.headerTitle}>All Chores</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/chores/create')}
          activeOpacity={0.7}
        >
          <IconSymbol name="plus" size={20} color="#000000" />
        </TouchableOpacity>
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
          {chores.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="list.bullet.clipboard" size={64} color="#8B8B8B" />
              <ThemedText style={styles.emptyStateText}>No chores created yet</ThemedText>
              <ThemedText style={styles.emptyStateHint}>
                Tap the + button to create your first chore
              </ThemedText>
            </View>
          ) : (
            <>
              {chores.map((chore) => (
                <ChoreListItem
                  key={chore.id}
                  chore={chore}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAssign={handleAssign}
                />
              ))}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFC125',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFC125',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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

