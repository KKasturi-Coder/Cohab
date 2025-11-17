import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UpdateChoreInput, Chore } from '@/lib/graphql/types';
import { updateChore } from '@/lib/graphql/mutations/chores';
import { getHouseholdChores } from '@/lib/graphql/queries/chores';
import { getCurrentHousehold } from '@/lib/graphql-client';

const RECURRENCE_OPTIONS = [
  { label: 'One-time', value: 'none', icon: 'calendar' },
  { label: 'Daily', value: 'daily', icon: 'sun.max.fill' },
  { label: 'Weekly', value: 'weekly', icon: 'calendar.badge.clock' },
  { label: 'Monthly', value: 'monthly', icon: 'calendar' },
];

export default function EditChoreScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const choreId = params.choreId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChore, setIsLoadingChore] = useState(true);
  const [chore, setChore] = useState<Chore | null>(null);
  const [formData, setFormData] = useState<UpdateChoreInput>({
    title: '',
    description: '',
    recurrence: 'none',
    points: 10,
    requiresProof: false,
  });

  useEffect(() => {
    const loadChore = async () => {
      try {
        setIsLoadingChore(true);
        const household = await getCurrentHousehold();
        if (!household) {
          router.replace('/');
          return;
        }

        const chores = await getHouseholdChores(household.id, 100);
        const foundChore = chores.find((c) => c.id === choreId);
        if (!foundChore) {
          Alert.alert('Error', 'Chore not found', [{ text: 'OK', onPress: () => router.back() }]);
          return;
        }

        setChore(foundChore);
        setFormData({
          title: foundChore.title,
          description: foundChore.description || '',
          recurrence: foundChore.recurrence as any,
          points: foundChore.points,
          requiresProof: foundChore.requiresProof,
        });
      } catch (error) {
        console.error('Error loading chore:', error);
        Alert.alert('Error', 'Failed to load chore', [{ text: 'OK', onPress: () => router.back() }]);
      } finally {
        setIsLoadingChore(false);
      }
    };

    if (choreId) {
      loadChore();
    }
  }, [choreId]);

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      Alert.alert('Error', 'Please enter a chore title');
      return;
    }

    if (!choreId) {
      Alert.alert('Error', 'Chore ID not found');
      return;
    }

    try {
      setIsLoading(true);
      await updateChore(choreId, formData);
      Alert.alert('Success', 'Chore updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update chore');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingChore) {
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
        <ThemedText style={styles.headerTitle}>Edit Chore</ThemedText>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={isLoading || !formData.title?.trim()}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <ThemedText
              style={[
                styles.saveButtonText,
                (!formData.title?.trim() || isLoading) && styles.saveButtonTextDisabled,
              ]}
            >
              Save
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Title *</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g., Take out trash"
            placeholderTextColor="#8B8B8B"
            editable={!isLoading}
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Optional details about this chore"
            placeholderTextColor="#8B8B8B"
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />
        </View>

        {/* Recurrence */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Recurrence</ThemedText>
          <View style={styles.recurrenceGrid}>
            {RECURRENCE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.recurrenceOption,
                  formData.recurrence === option.value && styles.recurrenceOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, recurrence: option.value as any })}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={option.icon as any}
                  size={20}
                  color={formData.recurrence === option.value ? '#000000' : '#FFC125'}
                />
                <ThemedText
                  style={[
                    styles.recurrenceOptionText,
                    formData.recurrence === option.value && styles.recurrenceOptionTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Points */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Points</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.points?.toString() || ''}
            onChangeText={(text) =>
              setFormData({ ...formData, points: parseInt(text) || 0 })
            }
            placeholder="10"
            placeholderTextColor="#8B8B8B"
            keyboardType="number-pad"
            editable={!isLoading}
          />
          <ThemedText style={styles.hint}>Points earned when completing this chore</ThemedText>
        </View>

        {/* Requires Proof */}
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() =>
              setFormData({ ...formData, requiresProof: !formData.requiresProof })
            }
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <View style={styles.checkbox}>
              {formData.requiresProof && (
                <IconSymbol name="checkmark" size={16} color="#FFC125" />
              )}
            </View>
            <View style={styles.checkboxLabelContainer}>
              <ThemedText style={styles.checkboxLabel}>Requires proof of completion</ThemedText>
              <ThemedText style={styles.checkboxHint}>
                User must upload a photo when completing
              </ThemedText>
            </View>
          </TouchableOpacity>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFC125',
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  saveButtonTextDisabled: {
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC125',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFC125',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#8B8B8B',
    marginTop: 8,
  },
  recurrenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recurrenceOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  recurrenceOptionActive: {
    backgroundColor: '#FFC125',
    borderColor: '#FFC125',
  },
  recurrenceOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFC125',
  },
  recurrenceOptionTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFC125',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFC125',
    marginBottom: 4,
  },
  checkboxHint: {
    fontSize: 12,
    color: '#8B8B8B',
  },
});

