import React from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface ExpenseModalProps {
  visible: boolean;
  isEditing: boolean;
  title: string;
  description: string;
  amount: string;
  category: string;
  selectedRoommates: string[];
  roommates: Array<{ id: string; name: string }>;
  userId: string | null;
  creating: boolean;
  onClose: () => void;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onAmountChange: (text: string) => void;
  onCategoryChange: (category: string) => void;
  onRoommateToggle: (id: string) => void;
  onSubmit: () => void;
}

const CATEGORIES = ['groceries', 'rent', 'utilities', 'cleaning', 'maintenance', 'other'];

export default function ExpenseModal({
  visible,
  isEditing,
  title,
  description,
  amount,
  category,
  selectedRoommates,
  roommates,
  userId,
  creating,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onAmountChange,
  onCategoryChange,
  onRoommateToggle,
  onSubmit,
}: ExpenseModalProps) {
  const amountPerPerson =
    selectedRoommates.length > 0 && amount
      ? (parseFloat(amount) / selectedRoommates.length).toFixed(2)
      : '0.00';

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              {isEditing ? 'Edit Expense' : 'Create Expense'}
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={styles.closeButton}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Info Box */}
            <View style={styles.infoBox}>
              <ThemedText style={styles.infoText}>
                💡 You already paid for this expense. Select roommates who owe you their share.
              </ThemedText>
            </View>

            {/* Title */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Title *</ThemedText>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={onTitleChange}
                placeholder="e.g., Groceries, Rent, Utilities"
                placeholderTextColor="#666"
              />
            </View>

            {/* Amount */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Total Amount *</ThemedText>
              <View style={styles.amountInputContainer}>
                <ThemedText style={styles.currencySymbol}>$</ThemedText>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={onAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Description (Optional)</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={onDescriptionChange}
                placeholder="Add details about this expense..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Category</ThemedText>
              <View style={styles.categoryButtons}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                    onPress={() => onCategoryChange(cat)}
                  >
                    <ThemedText
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Split With */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Who owes you? *</ThemedText>
              <ThemedText style={styles.hint}>
                {selectedRoommates.length} selected · Each owes ${amountPerPerson}
              </ThemedText>
              <View style={styles.roommatesList}>
                {roommates.map((roommate) => (
                  <TouchableOpacity
                    key={roommate.id}
                    style={[
                      styles.roommateChip,
                      selectedRoommates.includes(roommate.id) && styles.roommateChipActive,
                    ]}
                    onPress={() => onRoommateToggle(roommate.id)}
                  >
                    <ThemedText
                      style={[
                        styles.roommateChipText,
                        selectedRoommates.includes(roommate.id) && styles.roommateChipTextActive,
                      ]}
                    >
                      {roommate.name} {roommate.id === userId && '(You)'}
                    </ThemedText>
                    {selectedRoommates.includes(roommate.id) && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, creating && styles.submitButtonDisabled]}
              onPress={onSubmit}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <ThemedText style={styles.submitButtonText}>
                  {isEditing ? 'Update Expense' : 'Create Expense'}
                </ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#FFC125',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC125',
  },
  closeButton: {
    fontSize: 28,
    color: '#FFC125',
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 193, 37, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FFC125',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#D4AF37',
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC125',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFC125',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    fontSize: 16,
    color: '#FFF',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#555',
  },
  categoryButtonActive: {
    backgroundColor: '#FFC125',
    borderColor: '#FFC125',
  },
  categoryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryButtonTextActive: {
    color: '#000',
  },
  roommatesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roommateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#555',
    gap: 6,
  },
  roommateChipActive: {
    backgroundColor: '#FFC125',
    borderColor: '#FFC125',
  },
  roommateChipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  roommateChipTextActive: {
    color: '#000',
  },
  checkmark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FFC125',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
