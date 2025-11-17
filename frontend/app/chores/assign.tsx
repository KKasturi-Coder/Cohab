import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Chore, Roommate, CreateChoreAssignmentInput } from '@/lib/graphql/types';
import { createChoreAssignment } from '@/lib/graphql/mutations/chores';
import { getHouseholdChores } from '@/lib/graphql/queries/chores';
import { getCurrentHousehold } from '@/lib/graphql-client';

export default function AssignChoreScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const choreId = params.choreId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [chore, setChore] = useState<Chore | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const household = await getCurrentHousehold();
        if (!household) {
          router.replace('/');
          return;
        }

        // Load chore
        if (choreId) {
          const chores = await getHouseholdChores(household.id, 100);
          const foundChore = chores.find((c) => c.id === choreId);
          if (!foundChore) {
            Alert.alert('Error', 'Chore not found', [{ text: 'OK', onPress: () => router.back() }]);
            return;
          }
          setChore(foundChore);
        }

        // Load roommates
        setRoommates(household.roommates || []);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load data', [{ text: 'OK', onPress: () => router.back() }]);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [choreId]);

  const handleSubmit = async () => {
    if (!chore || !selectedUserId) {
      Alert.alert('Error', 'Please select a roommate');
      return;
    }

    try {
      setIsLoading(true);
      await createChoreAssignment({
        choreId: chore.id,
        userId: selectedUserId,
        dueDate: dueDate.toISOString(),
      });
      Alert.alert('Success', 'Chore assigned successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to assign chore');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData || !chore) {
    return (
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC125" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <IconSymbol name="xmark" size={24} color="#FFC125" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Assign Chore</ThemedText>
        <TouchableOpacity
          style={styles.assignButton}
          onPress={handleSubmit}
          disabled={isLoading || !selectedUserId}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <ThemedText
              style={[
                styles.assignButtonText,
                (!selectedUserId || isLoading) && styles.assignButtonTextDisabled,
              ]}
            >
              Assign
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Chore Info */}
        <View style={styles.choreInfo}>
          <ThemedText style={styles.choreTitle}>{chore.title}</ThemedText>
          {chore.description && (
            <ThemedText style={styles.choreDescription}>{chore.description}</ThemedText>
          )}
          <View style={styles.choreBadges}>
            <View style={styles.choreBadge}>
              <ThemedText style={styles.choreBadgeText}>⭐ {chore.points} points</ThemedText>
            </View>
            {chore.requiresProof && (
              <View style={styles.choreBadge}>
                <ThemedText style={styles.choreBadgeText}>📸 Proof required</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Assign to */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Assign to</ThemedText>
          {roommates.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>No roommates available</ThemedText>
            </View>
          ) : (
            <View style={styles.roommatesList}>
              {roommates.map((roommate) => (
                <TouchableOpacity
                  key={roommate.profile.id}
                  style={[
                    styles.roommateOption,
                    selectedUserId === roommate.profile.id && styles.roommateOptionSelected,
                  ]}
                  onPress={() => setSelectedUserId(roommate.profile.id)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  {roommate.profile.avatarUrl ? (
                    <Image source={{ uri: roommate.profile.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <ThemedText style={styles.avatarText}>
                        {roommate.profile.fullName?.charAt(0).toUpperCase() || '?'}
                      </ThemedText>
                    </View>
                  )}
                  <ThemedText style={styles.roommateName}>
                    {roommate.profile.fullName || 'Unknown'}
                  </ThemedText>
                  {selectedUserId === roommate.profile.id && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#FFC125" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Due Date</ThemedText>
          <View style={styles.dateDisplay}>
            <IconSymbol name="calendar" size={20} color="#FFC125" />
            <ThemedText style={styles.dateText}>
              {dueDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </ThemedText>
          </View>
          <View style={styles.quickDateButtons}>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => setDueDate(new Date())}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.quickDateButtonText}>Today</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setDueDate(tomorrow);
              }}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.quickDateButtonText}>Tomorrow</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                setDueDate(nextWeek);
              }}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.quickDateButtonText}>Next Week</ThemedText>
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
  assignButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFC125',
    minWidth: 70,
    alignItems: 'center',
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  assignButtonTextDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  choreInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  choreTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFC125',
    marginBottom: 8,
  },
  choreDescription: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 12,
    lineHeight: 20,
  },
  choreBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  choreBadge: {
    backgroundColor: 'rgba(255, 193, 37, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
  },
  choreBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFC125',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFC125',
    marginBottom: 16,
  },
  roommatesList: {
    gap: 12,
  },
  roommateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 37, 0.2)',
    gap: 12,
  },
  roommateOptionSelected: {
    backgroundColor: 'rgba(255, 193, 37, 0.1)',
    borderColor: '#FFC125',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC125',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC125',
  },
  roommateName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC125',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  dateText: {
    fontSize: 16,
    color: '#FFC125',
    fontWeight: '500',
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
  },
  quickDateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC125',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8B8B8B',
  },
});

