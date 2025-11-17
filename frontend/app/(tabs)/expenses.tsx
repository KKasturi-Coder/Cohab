import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import {
  getMyExpenses,
  getExpenseSplits,
  generatePaymentURL,
  markExpensePaid,
  type Expense,
  type ExpenseSplit,
} from '@/lib/graphql-client';

interface ExpenseWithSplits extends Expense {
  splits?: ExpenseSplit[];
  paidByName?: string;
}

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setUserId(session.user.id);
      setIsCheckingAuth(false);
      await loadExpenses();
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const myExpenses = await getMyExpenses();
      
      // Load splits and payer info for each expense
      const expensesWithDetails = await Promise.all(
        myExpenses.map(async (expense) => {
          const splits = await getExpenseSplits(expense.id);
          
          // Get payer name
          const { data: payerData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', expense.paidBy)
            .single();
          
          return {
            ...expense,
            splits,
            paidByName: (payerData as any)?.full_name || 'Unknown',
          };
        })
      );
      
      setExpenses(expensesWithDetails);
    } catch (error) {
      console.error('Error loading expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handlePayExpense = async (split: ExpenseSplit) => {
    try {
      // Generate payment URL
      const result = await generatePaymentURL({
        expenseSplitId: split.id,
      });

      if (result && result.paymentUrl) {
        // Open the payment app
        const supported = await Linking.canOpenURL(result.paymentUrl);
        if (supported) {
          await Linking.openURL(result.paymentUrl);
          
          // Ask if they completed the payment
          setTimeout(() => {
            Alert.alert(
              'Payment Confirmation',
              'Did you complete the payment?',
              [
                {
                  text: 'Not Yet',
                  style: 'cancel',
                },
                {
                  text: 'Yes, Mark as Paid',
                  onPress: async () => {
                    await markExpensePaid({ expenseSplitId: split.id });
                    await loadExpenses();
                    Alert.alert('Success', 'Expense marked as paid!');
                  },
                },
              ]
            );
          }, 1000);
        } else {
          Alert.alert(
            'Cannot Open Payment App',
            `Please install ${result.paymentMethod} or copy this URL:\n\n${result.paymentUrl}`,
            [
              {
                text: 'Copy URL',
                onPress: async () => {
                  // Import Clipboard
                  const Clipboard = (await import('expo-clipboard')).default;
                  await Clipboard.setStringAsync(result.paymentUrl);
                  Alert.alert('Copied', 'Payment URL copied to clipboard');
                },
              },
              { text: 'OK' },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Error generating payment URL:', error);
      Alert.alert('Error', error.message || 'Failed to generate payment link');
    }
  };

  const handleMarkAsPaid = async (split: ExpenseSplit) => {
    Alert.alert(
      'Mark as Paid',
      'Have you completed the payment for this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Mark as Paid',
          onPress: async () => {
            try {
              await markExpensePaid({ expenseSplitId: split.id });
              await loadExpenses();
              Alert.alert('Success', 'Expense marked as paid!');
            } catch (error) {
              console.error('Error marking expense as paid:', error);
              Alert.alert('Error', 'Failed to mark expense as paid');
            }
          },
        },
      ]
    );
  };

  if (isCheckingAuth) {
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
      <ScrollView
        style={[styles.scrollView, { paddingTop: insets.top + 20 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFC125" />
        }
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Expenses</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your pending expenses and payments
          </ThemedText>
        </View>

        {loading && expenses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC125" />
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No expenses yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Expenses you owe will appear here
            </ThemedText>
          </View>
        ) : (
          <View style={styles.expensesList}>
            {expenses.map((expense) => {
              const mySplit = expense.splits?.find((s) => s.userId === userId);
              if (!mySplit) return null;

              return (
                <View key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseHeader}>
                    <View style={styles.expenseInfo}>
                      <ThemedText style={styles.expenseTitle}>{expense.title}</ThemedText>
                      {expense.description && (
                        <ThemedText style={styles.expenseDescription}>
                          {expense.description}
                        </ThemedText>
                      )}
                      <ThemedText style={styles.expensePayee}>
                        Paid by: {expense.paidByName}
                      </ThemedText>
                    </View>
                    <View style={styles.amountContainer}>
                      <ThemedText style={styles.expenseAmount}>
                        ${mySplit.amount.toFixed(2)}
                      </ThemedText>
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

                  <View style={styles.expenseActions}>
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
                        <TouchableOpacity
                          style={styles.payButton}
                          onPress={() => handlePayExpense(mySplit)}
                        >
                          <ThemedText style={styles.payButtonText}>
                            💳 Pay with {mySplit.paymentMethod || 'App'}
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.markPaidButton}
                          onPress={() => handleMarkAsPaid(mySplit)}
                        >
                          <ThemedText style={styles.markPaidButtonText}>Mark as Paid</ThemedText>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFC125',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#D4AF37',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFC125',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  expensesList: {
    padding: 20,
    paddingTop: 10,
  },
  expenseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 16,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC125',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  expensePayee: {
    fontSize: 12,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
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
  expenseActions: {
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

