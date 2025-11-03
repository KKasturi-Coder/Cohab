import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Chore, Profile, CreateChoreAssignmentInput } from '@/lib/graphql/types';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface AssignChoreModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChoreAssignmentInput) => Promise<void>;
  chore: Chore | null;
  roommates: Profile[];
}

export function AssignChoreModal({
  visible,
  onClose,
  onSubmit,
  chore,
  roommates,
}: AssignChoreModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(new Date());

  const handleSubmit = async () => {
    if (!chore || !selectedUserId) {
      Alert.alert('Error', 'Please select a roommate');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({
        choreId: chore.id,
        userId: selectedUserId,
        dueDate: dueDate.toISOString(),
      });
      setSelectedUserId(null);
      setDueDate(new Date());
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to assign chore');
    } finally {
      setIsLoading(false);
    }
  };

  if (!chore) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Assign Chore</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isLoading || !selectedUserId}>
            {isLoading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text
                style={[
                  styles.modalSave,
                  !selectedUserId && styles.modalSaveDisabled,
                ]}
              >
                Assign
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.choreInfo}>
            <Text style={styles.choreTitle}>{chore.title}</Text>
            {chore.description && (
              <Text style={styles.choreDescription}>{chore.description}</Text>
            )}
            <Text style={styles.chorePoints}>⭐ {chore.points} points</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assign to</Text>
            {roommates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No roommates available</Text>
              </View>
            ) : (
              <View style={styles.roommatesList}>
                {roommates.map((roommate) => (
                  <TouchableOpacity
                    key={roommate.id}
                    style={[
                      styles.roommateOption,
                      selectedUserId === roommate.id && styles.roommateOptionSelected,
                    ]}
                    onPress={() => setSelectedUserId(roommate.id)}
                    disabled={isLoading}
                  >
                    {roommate.avatarUrl ? (
                      <Image
                        source={{ uri: roommate.avatarUrl }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                          {roommate.fullName?.charAt(0).toUpperCase() || '?'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.roommateName}>
                      {roommate.fullName || 'Unknown'}
                    </Text>
                    {selectedUserId === roommate.id && (
                      <IconSymbol name="checkmark.circle.fill" size={24} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due date</Text>
            <View style={styles.dateSelected}>
              <IconSymbol name="calendar" size={20} color="#007AFF" />
              <Text style={styles.dateSelectedText}>
                {dueDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.quickDateButtons}>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => setDueDate(new Date())}
                disabled={isLoading}
              >
                <Text style={styles.quickDateButtonText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setDueDate(tomorrow);
                }}
                disabled={isLoading}
              >
                <Text style={styles.quickDateButtonText}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setDueDate(nextWeek);
                }}
                disabled={isLoading}
              >
                <Text style={styles.quickDateButtonText}>Next Week</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalSaveDisabled: {
    opacity: 0.4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  choreInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  choreTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  choreDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chorePoints: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  roommatesList: {
    gap: 8,
  },
  roommateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roommateOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  roommateName: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  dateSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  dateSelectedText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickDateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
});
