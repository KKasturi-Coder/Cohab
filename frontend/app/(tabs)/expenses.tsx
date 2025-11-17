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
  createExpense,
  updateExpense,
  deleteExpense,
  getCurrentHousehold,
  type Expense,
  type ExpenseSplit,
} from '@/lib/graphql-client';
import EmptyState from '@/components/expenses/EmptyState';
import TabsView from '@/components/expenses/TabsView';
import IOweCard from '@/components/expenses/IOweCard';
import OwedToMeCard from '@/components/expenses/OwedToMeCard';
import ExpenseModal from '@/components/expenses/ExpenseModal';

interface ExpenseWithSplits extends Expense {
  splits?: ExpenseSplit[];
  paidByName?: string;
  payeePaymentMethod?: string; // Preferred payment method of person who paid
}

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [myCreatedExpenses, setMyCreatedExpenses] = useState<ExpenseWithSplits[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'owe' | 'owed'>('owe'); // Toggle between views
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [selectedRoommates, setSelectedRoommates] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  
  // Edit state
  const [editingExpense, setEditingExpense] = useState<ExpenseWithSplits | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setUserId(session.user.id);
      setIsCheckingAuth(false);
      await loadHouseholdData();
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

  const loadHouseholdData = async () => {
    try {
      const household = await getCurrentHousehold();
      if (household && household.id) {
        setHouseholdId(household.id);
        
        // Get roommates from household
        if (household.roommates) {
          setRoommates(household.roommates.map((r: any) => ({
            id: r.userId,
            name: r.profile?.fullName || 'Unknown',
          })));
        }
      }
    } catch (error) {
      console.error('Error loading household:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const myExpenses = await getMyExpenses();
      
      // Separate expenses into ones I owe vs ones I created
      const expensesIOwe = myExpenses.filter(expense => expense.paidBy !== userId);
      const expensesICreated = myExpenses.filter(expense => expense.paidBy === userId);
      
      // Load splits and payer info for expenses I owe
      const oweExpensesWithDetails = await Promise.all(
        expensesIOwe.map(async (expense) => {
          const splits = await getExpenseSplits(expense.id);
          
          // Get payer name and payment method
          const { data: payerData } = await supabase
            .from('profiles')
            .select('full_name, preferred_payment_method, venmo_handle, paypal_email, cashapp_handle, zelle_email')
            .eq('id', expense.paidBy)
            .single();
          
          // Determine which payment method to show
          let paymentMethod = null;
          if (payerData) {
            const payer = payerData as any;
            paymentMethod = payer.preferred_payment_method;
            
            // Fallback to first available method if preferred not set
            if (!paymentMethod) {
              if (payer.venmo_handle) paymentMethod = 'venmo';
              else if (payer.paypal_email) paymentMethod = 'paypal';
              else if (payer.cashapp_handle) paymentMethod = 'cashapp';
              else if (payer.zelle_email) paymentMethod = 'zelle';
            }
          }
          
          return {
            ...expense,
            splits,
            paidByName: (payerData as any)?.full_name || 'Unknown',
            payeePaymentMethod: paymentMethod,
          };
        })
      );
      
      // Load splits for expenses I created
      const createdExpensesWithDetails = await Promise.all(
        expensesICreated.map(async (expense) => {
          const splits = await getExpenseSplits(expense.id);
          return {
            ...expense,
            splits,
            paidByName: 'You',
            payeePaymentMethod: undefined,
          };
        })
      );
      
      setExpenses(oweExpensesWithDetails);
      setMyCreatedExpenses(createdExpensesWithDetails);
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

  const handleCreateExpense = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (selectedRoommates.length === 0) {
      Alert.alert('Error', 'Please select at least one person to split with');
      return;
    }
    if (!householdId) {
      Alert.alert('Error', 'No household found');
      return;
    }

    setCreating(true);
    try {
      await createExpense({
        householdId,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: parseFloat(amount),
        currency: 'USD',
        category: category as any,
        splitWith: selectedRoommates,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setAmount('');
      setCategory('other');
      setSelectedRoommates([]);
      setShowCreateModal(false);

      // Reload expenses
      await loadExpenses();
      Alert.alert('Success', 'Expense created and split among roommates!');
    } catch (error: any) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', error.message || 'Failed to create expense');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This will remove it for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              await loadExpenses();
              Alert.alert('Success', 'Expense deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const handleEditExpense = (expense: ExpenseWithSplits) => {
    setEditingExpense(expense);
    setTitle(expense.title || '');
    setDescription(expense.description || '');
    setAmount(expense.amount?.toString() || '');
    setCategory(expense.category || 'other');
    
    // Load the splits
    if (expense.splits) {
      setSelectedRoommates(expense.splits.map(s => s.userId!));
    }
    
    setShowCreateModal(true);
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setCreating(true);
    try {
      await updateExpense(editingExpense.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: parseFloat(amount),
        category: category as any,
      });

      // TODO: Update splits if changed
      // For now, updating expense metadata only

      // Reset form
      resetForm();
      
      // Reload expenses
      await loadExpenses();
      Alert.alert('Success', 'Expense updated!');
    } catch (error: any) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', error.message || 'Failed to update expense');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setCategory('other');
    setSelectedRoommates([]);
    setEditingExpense(null);
    setShowCreateModal(false);
  };

  const toggleRoommate = (roommateId: string) => {
    if (selectedRoommates.includes(roommateId)) {
      setSelectedRoommates(selectedRoommates.filter(id => id !== roommateId));
    } else {
      setSelectedRoommates([...selectedRoommates, roommateId]);
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
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.title}>Expenses</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setSelectedRoommates([]);
                setShowCreateModal(true);
              }}
            >
              <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
            </TouchableOpacity>
          </View>
          
          {/* View Toggle Tabs */}
          <TabsView
            viewMode={viewMode}
            oweCount={expenses.length}
            owedCount={myCreatedExpenses.length}
            onViewModeChange={setViewMode}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC125" />
          </View>
        ) : viewMode === 'owe' ? (
          expenses.length === 0 ? (
            <EmptyState
              title="All paid up! 🎉"
              subtitle="You don't owe anyone money right now"
            />
          ) : (
            <View style={styles.expensesList}>
              {expenses.map((expense) => (
                <IOweCard
                  key={expense.id}
                  expense={expense}
                  userId={userId}
                  onPay={handlePayExpense}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              ))}
            </View>
          )
        ) : (
          myCreatedExpenses.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              subtitle="Create an expense to track who owes you"
            />
          ) : (
            <View style={styles.expensesList}>
              {myCreatedExpenses.map((expense) => (
                <OwedToMeCard
                  key={expense.id}
                  expense={expense}
                  roommates={roommates}
                  onEdit={() => handleEditExpense(expense)}
                  onDelete={() => handleDeleteExpense(expense.id)}
                />
              ))}
            </View>
          )
        )}
      </ScrollView>

      {/* Create/Edit Expense Modal */}
      <ExpenseModal
        visible={showCreateModal}
        isEditing={!!editingExpense}
        title={title}
        description={description}
        amount={amount}
        category={category}
        selectedRoommates={selectedRoommates}
        roommates={roommates}
        userId={userId}
        creating={creating}
        onClose={resetForm}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onAmountChange={setAmount}
        onCategoryChange={setCategory}
        onRoommateToggle={toggleRoommate}
        onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
      />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFC125',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#FFC125',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expensesList: {
    padding: 20,
    paddingTop: 10,
  },
});

