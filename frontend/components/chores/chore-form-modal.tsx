import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Chore, CreateChoreInput, UpdateChoreInput } from '@/lib/graphql/types';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ChoreFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChoreInput | UpdateChoreInput) => Promise<void>;
  chore?: Chore | null;
  householdId: string;
}

const RECURRENCE_OPTIONS = [
  { label: 'One-time', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export function ChoreFormModal({
  visible,
  onClose,
  onSubmit,
  chore,
  householdId,
}: ChoreFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateChoreInput>({
    householdId,
    title: '',
    description: '',
    recurrence: 'none',
    points: 10,
    requiresProof: false,
  });

  useEffect(() => {
    if (chore) {
      setFormData({
        householdId: chore.householdId,
        title: chore.title,
        description: chore.description || '',
        recurrence: chore.recurrence as any,
        points: chore.points,
        requiresProof: chore.requiresProof,
      });
    } else {
      setFormData({
        householdId,
        title: '',
        description: '',
        recurrence: 'none',
        points: 10,
        requiresProof: false,
      });
    }
  }, [chore, householdId, visible]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a chore title');
      return;
    }

    try {
      setIsLoading(true);
      if (chore) {
        // Update: exclude householdId
        const { householdId: _, ...updateData } = formData;
        await onSubmit(updateData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save chore');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Text style={styles.modalTitle}>{chore ? 'Edit Chore' : 'New Chore'}</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={styles.modalSave}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="e.g., Take out trash"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Optional details about this chore"
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recurrence</Text>
            <View style={styles.recurrenceOptions}>
              {RECURRENCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.recurrenceOption,
                    formData.recurrence === option.value && styles.recurrenceOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, recurrence: option.value as any })}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.recurrenceOptionText,
                      formData.recurrence === option.value && styles.recurrenceOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Points</Text>
            <TextInput
              style={styles.input}
              value={formData.points?.toString() || ''}
              onChangeText={(text) =>
                setFormData({ ...formData, points: parseInt(text) || 0 })
              }
              placeholder="10"
              keyboardType="number-pad"
              editable={!isLoading}
            />
            <Text style={styles.inputHint}>Points earned when completing this chore</Text>
          </View>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() =>
                setFormData({ ...formData, requiresProof: !formData.requiresProof })
              }
              disabled={isLoading}
            >
              <View style={styles.checkbox}>
                {formData.requiresProof && (
                  <IconSymbol name="checkmark" size={16} color="#007AFF" />
                )}
              </View>
              <View style={styles.checkboxLabelContainer}>
                <Text style={styles.checkboxLabel}>Requires proof of completion</Text>
                <Text style={styles.checkboxHint}>User must upload a photo when completing</Text>
              </View>
            </TouchableOpacity>
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurrenceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  recurrenceOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  recurrenceOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  recurrenceOptionTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  checkboxHint: {
    fontSize: 12,
    color: '#666',
  },
});
