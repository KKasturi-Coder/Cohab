import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { getCurrentHousehold, getHouseholdChoreAssignments, type ChoreAssignment } from '@/lib/graphql-client';

type ActivityType = 'chore_completed';

interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: string;
  actorName: string;
  choreTitle?: string;
  proofImageUrl?: string;
}

export default function GroupActivityScreen() {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatCompletedAt = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const household = await getCurrentHousehold();
        if (!household) {
          setError('No household found');
          setActivities([]);
          return;
        }

        // Get household chore assignments including completed ones
        const assignments: ChoreAssignment[] = await getHouseholdChoreAssignments(
          household.id,
          true,
          100
        );

        const completed = assignments
          .filter((a) => a.isComplete && a.completedAt)
          .sort((a, b) => {
            const aTime = new Date(a.completedAt || '').getTime();
            const bTime = new Date(b.completedAt || '').getTime();
            return bTime - aTime;
          })
          .map<ActivityItem>((a) => ({
            id: a.id,
            type: 'chore_completed',
            actorName: a.user.fullName || 'Unknown',
            choreTitle: a.chore.title,
            timestamp: a.completedAt ? formatCompletedAt(a.completedAt) : '',
            proofImageUrl: a.proofUrl,
          }));

        setActivities(completed);
      } catch (e) {
        console.error('Error loading activity feed:', e);
        setError('Failed to load activity feed');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, []);

  const renderIconForType = (type: ActivityType) => {
    switch (type) {
      case 'chore_completed':
        return <IconSymbol name="checkmark.circle.fill" size={22} color="#4CAF50" />;
      default:
        return null;
    }
  };

  const renderTitleForItem = (item: ActivityItem) => {
    switch (item.type) {
      case 'chore_completed':
        return `${item.actorName} completed "${item.choreTitle}"`;
      default:
        return '';
    }
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
        <ThemedText style={styles.headerTitle}>Household Activity</ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View style={styles.emptyState}>
            <IconSymbol name="clock.arrow.circlepath" size={32} color="#8B8B8B" />
            <ThemedText style={styles.emptyStateText}>Loading activity...</ThemedText>
          </View>
        )}

        {!isLoading && error && (
          <View style={styles.emptyState}>
            <IconSymbol name="exclamationmark.triangle.fill" size={32} color="#CD853F" />
            <ThemedText style={styles.emptyStateText}>{error}</ThemedText>
          </View>
        )}

        {!isLoading && !error && activities.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.activityCard}
            activeOpacity={item.proofImageUrl ? 0.8 : 1}
            onPress={() => {
              if (item.proofImageUrl) {
                setSelectedImage(item.proofImageUrl);
              }
            }}
          >
            <View style={styles.activityIcon}>{renderIconForType(item.type)}</View>
            <View style={styles.activityInfo}>
              <ThemedText style={styles.activityTitle}>{renderTitleForItem(item)}</ThemedText>
              <ThemedText style={styles.activityTimestamp}>{item.timestamp}</ThemedText>
              {item.proofImageUrl && (
                <View style={styles.proofTag}>
                  <IconSymbol name="photo.on.rectangle" size={14} color="#FFC125" />
                  <Text style={styles.proofTagText}>View proof</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {!isLoading && !error && activities.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol name="clock.arrow.circlepath" size={48} color="#8B8B8B" />
            <ThemedText style={styles.emptyStateText}>No activity yet</ThemedText>
            <ThemedText style={styles.emptyStateHint}>
              Completed chores (with any photo proof) will appear here
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Proof image preview modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedImage(null)}
            >
              <IconSymbol name="xmark.circle.fill" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="cover" />
            )}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 193, 37, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFC125',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 12,
    color: '#D4AF37',
  },
  proofTag: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 37, 0.15)',
  },
  proofTagText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#FFC125',
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#FFC125',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateHint: {
    fontSize: 13,
    color: '#D4AF37',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  modalImage: {
    width: '100%',
    height: 320,
    borderRadius: 16,
  },
});


