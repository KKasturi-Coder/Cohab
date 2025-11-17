import { graphqlRequest } from '../core';
import { EXPENSE_FIELDS, EXPENSE_SPLIT_FIELDS } from '../fragments';
import { Expense, ExpenseSplit } from '../types';

/**
 * Get my expenses (expenses I owe money for)
 */
const MY_EXPENSES_QUERY = `
  query MyExpenses {
    expenses {
      myExpenses {
        ${EXPENSE_FIELDS}
      }
    }
  }
`;

export async function getMyExpenses(): Promise<Expense[]> {
  const result = await graphqlRequest<{ expenses: { myExpenses: Expense[] } }>(
    MY_EXPENSES_QUERY
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch my expenses');
  }

  return result.data?.expenses?.myExpenses || [];
}

/**
 * Get household expenses
 */
const HOUSEHOLD_EXPENSES_QUERY = `
  query HouseholdExpenses($householdId: String!) {
    expenses {
      householdExpenses(householdId: $householdId) {
        ${EXPENSE_FIELDS}
      }
    }
  }
`;

export async function getHouseholdExpenses(householdId: string): Promise<Expense[]> {
  const result = await graphqlRequest<{ expenses: { householdExpenses: Expense[] } }>(
    HOUSEHOLD_EXPENSES_QUERY,
    { householdId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch household expenses');
  }

  return result.data?.expenses?.householdExpenses || [];
}

/**
 * Get expense splits for an expense
 */
const EXPENSE_SPLITS_QUERY = `
  query ExpenseSplits($expenseId: String!) {
    expenses {
      expenseSplits(expenseId: $expenseId) {
        ${EXPENSE_SPLIT_FIELDS}
      }
    }
  }
`;

export async function getExpenseSplits(expenseId: string): Promise<ExpenseSplit[]> {
  const result = await graphqlRequest<{ expenses: { expenseSplits: ExpenseSplit[] } }>(
    EXPENSE_SPLITS_QUERY,
    { expenseId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch expense splits');
  }

  return result.data?.expenses?.expenseSplits || [];
}

/**
 * Get single expense by ID
 */
const GET_EXPENSE_QUERY = `
  query GetExpense($expenseId: String!) {
    expenses {
      expense(expenseId: $expenseId) {
        ${EXPENSE_FIELDS}
      }
    }
  }
`;

export async function getExpense(expenseId: string): Promise<Expense | null> {
  const result = await graphqlRequest<{ expenses: { expense: Expense } }>(
    GET_EXPENSE_QUERY,
    { expenseId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch expense');
  }

  return result.data?.expenses?.expense || null;
}
