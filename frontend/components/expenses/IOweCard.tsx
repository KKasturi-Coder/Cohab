import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ExpenseSplit } from '@/lib/graphql-client';

interface IOweCardProps {
  expense: {
    id: string;
    title?: string | null;
    description?: string | null;
    amount?: number | null;
    currency?: string | null;
    category?: string | null;
    dueDate?: string | null;
    paidByName?: string;
    payeePaymentMethod?: string;
    splits?: ExpenseSplit[];
  };
  userId: string | null;
  onPay: (split: ExpenseSplit) => void;
  onMarkAsPaid: (split: ExpenseSplit) => void;
}

export default function IOweCard({ expense, userId, onPay, onMarkAsPaid }: IOweCardProps) {
  const mySplit = expense.splits?.find((s) => s.userId === userId);
  if (!mySplit) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <ThemedText style={styles.title}>{expense.title}</ThemedText>
          {expense.description && (
            <ThemedText style={styles.description}>{expense.description}</ThemedText>
          )}
          <ThemedText style={styles.payee}>Paid by: {expense.paidByName}</ThemedText>
        </View>
        <View style={styles.amountContainer}>
          <ThemedText style={styles.amount}>${mySplit.amount.toFixed(2)}</ThemedText>
          <ThemedText style={styles.currency}>{expense.currency}</ThemedText>
        </View>
      </View>

      {expense.category && (
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryText}>{expense.category}</ThemedText>
        </View>
      )}

      {expense.dueDate && (
        <ThemedText style={styles.dueDate}>
          Due: {new Date(expense.dueDate).toLocaleDateString()}
        </ThemedText>
      )}

      <View style={styles.actions}>
        {mySplit.isPaid ? (
          <View style={styles.paidBadge}>
            <ThemedText style={styles.paidText}>✓ Paid</ThemedText>
            {mySplit.paidAt && (
              <ThemedText style={styles.paidDate}>
                {new Date(mySplit.paidAt).toLocaleDateString()}
              </ThemedText>
            )}
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.payButton} onPress={() => onPay(mySplit)}>
              <ThemedText style={styles.payButtonText}>
                {expense.payeePaymentMethod
                  ? `💳 Pay with ${expense.payeePaymentMethod.charAt(0).toUpperCase() + expense.payeePaymentMethod.slice(1)}`
                  : '💳 Pay'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.markPaidButton} onPress={() => onMarkAsPaid(mySplit)}>
              <ThemedText style={styles.markPaidButtonText}>Mark as Paid</ThemedText>
            </TouchableOpacity>
          </>
        )}
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
  payee: {
    fontSize: 12,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC125',
  },
  currency: {
    fontSize: 12,
    color: '#999',
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
  dueDate: {
    fontSize: 12,
    color: '#FF6B6B',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  payButton: {
    flex: 1,
    backgroundColor: '#FFC125',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  markPaidButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFC125',
  },
  markPaidButtonText: {
    color: '#FFC125',
    fontWeight: '600',
    fontSize: 14,
  },
  paidBadge: {
    flex: 1,
    backgroundColor: '#1B5E20',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  paidText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paidDate: {
    color: '#81C784',
    fontSize: 12,
    marginTop: 2,
  },
});
