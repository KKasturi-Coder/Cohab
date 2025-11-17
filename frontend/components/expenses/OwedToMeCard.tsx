import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ExpenseSplit } from '@/lib/graphql-client';

interface OwedToMeCardProps {
  expense: {
    id: string;
    title?: string | null;
    description?: string | null;
    amount?: number | null;
    category?: string | null;
    splits?: ExpenseSplit[];
  };
  roommates: Array<{ id: string; name: string }>;
  onEdit: () => void;
  onDelete: () => void;
}

export default function OwedToMeCard({ expense, roommates, onEdit, onDelete }: OwedToMeCardProps) {
  console.log('OwedToMeCard rendering for expense:', expense.title);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <ThemedText style={styles.title}>{expense.title}</ThemedText>
          {expense.description && (
            <ThemedText style={styles.description}>{expense.description}</ThemedText>
          )}
        </View>
        <View>
          <ThemedText style={styles.amount}>${expense.amount?.toFixed(2)}</ThemedText>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryText}>{expense.category}</ThemedText>
          </View>
        </View>
      </View>

      {/* Split Details */}
      <View style={styles.splitsSection}>
        <ThemedText style={styles.splitsTitle}>Split among:</ThemedText>
        {expense.splits?.map((split) => {
          const roommate = roommates.find((r) => r.id === split.userId);
          return (
            <View key={split.id} style={styles.splitRow}>
              <ThemedText style={styles.splitName}>
                {roommate?.name || 'Unknown'}: ${split.amount?.toFixed(2)}
              </ThemedText>
              {split.isPaid ? (
                <ThemedText style={styles.paidBadge}>✓ Paid</ThemedText>
              ) : (
                <ThemedText style={styles.unpaidBadge}>Pending</ThemedText>
              )}
            </View>
          );
        })}
      </View>

      {/* Edit/Delete Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <ThemedText style={styles.editButtonText}>✏️ Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <ThemedText style={styles.deleteButtonText}>🗑️ Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC125',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFC125',
    textAlign: 'right',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFC125',
    textTransform: 'capitalize',
  },
  splitsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  splitsTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  splitName: {
    fontSize: 14,
    color: '#FFF',
  },
  paidBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  unpaidBadge: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFC125',
  },
  editButtonText: {
    color: '#FFC125',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
