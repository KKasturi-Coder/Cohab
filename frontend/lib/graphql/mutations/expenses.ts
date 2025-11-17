import { graphqlRequest } from '../core';
import { EXPENSE_FIELDS } from '../fragments';
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  MarkExpensePaidInput,
  GeneratePaymentURLInput,
  Expense,
  PaymentURLResult,
} from '../types';

/**
 * Create expense mutation
 */
const CREATE_EXPENSE_MUTATION = `
  mutation CreateExpense($input: CreateExpenseInput!) {
    expenses {
      createExpense(input: $input) {
        ${EXPENSE_FIELDS}
      }
    }
  }
`;

export async function createExpense(input: CreateExpenseInput): Promise<Expense | null> {
  const result = await graphqlRequest<{ expenses: { createExpense: Expense } }>(
    CREATE_EXPENSE_MUTATION,
    { input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to create expense');
  }

  return result.data?.expenses?.createExpense || null;
}

/**
 * Update expense mutation
 */
const UPDATE_EXPENSE_MUTATION = `
  mutation UpdateExpense($expenseId: String!, $input: UpdateExpenseInput!) {
    expenses {
      updateExpense(expenseId: $expenseId, input: $input) {
        ${EXPENSE_FIELDS}
      }
    }
  }
`;

export async function updateExpense(
  expenseId: string,
  input: UpdateExpenseInput
): Promise<Expense | null> {
  const result = await graphqlRequest<{ expenses: { updateExpense: Expense } }>(
    UPDATE_EXPENSE_MUTATION,
    { expenseId, input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to update expense');
  }

  return result.data?.expenses?.updateExpense || null;
}

/**
 * Delete expense mutation
 */
const DELETE_EXPENSE_MUTATION = `
  mutation DeleteExpense($expenseId: String!) {
    expenses {
      deleteExpense(expenseId: $expenseId)
    }
  }
`;

export async function deleteExpense(expenseId: string): Promise<boolean> {
  const result = await graphqlRequest<{ expenses: { deleteExpense: boolean } }>(
    DELETE_EXPENSE_MUTATION,
    { expenseId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to delete expense');
  }

  return result.data?.expenses?.deleteExpense || false;
}

/**
 * Mark expense split as paid
 */
const MARK_EXPENSE_PAID_MUTATION = `
  mutation MarkExpensePaid($input: MarkExpensePaidInput!) {
    expenses {
      markExpensePaid(input: $input)
    }
  }
`;

export async function markExpensePaid(input: MarkExpensePaidInput): Promise<boolean> {
  const result = await graphqlRequest<{ expenses: { markExpensePaid: boolean } }>(
    MARK_EXPENSE_PAID_MUTATION,
    { input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to mark expense as paid');
  }

  return result.data?.expenses?.markExpensePaid || false;
}

/**
 * Generate payment URL for expense split
 */
const GENERATE_PAYMENT_URL_MUTATION = `
  mutation GeneratePaymentURL($input: GeneratePaymentURLInput!) {
    expenses {
      generatePaymentUrl(input: $input) {
        paymentUrl
        paymentMethod
        availableMethods
      }
    }
  }
`;

export async function generatePaymentURL(
  input: GeneratePaymentURLInput
): Promise<PaymentURLResult | null> {
  const result = await graphqlRequest<{ expenses: { generatePaymentUrl: PaymentURLResult } }>(
    GENERATE_PAYMENT_URL_MUTATION,
    { input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to generate payment URL');
  }

  return result.data?.expenses?.generatePaymentUrl || null;
}
