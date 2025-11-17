/**
 * GraphQL Client - Main Export File
 * 
 * This file re-exports all GraphQL functionality from organized modules.
 * The modular structure keeps the codebase maintainable as it grows.
 * 
 * Structure:
 * - graphql/config.ts - API endpoint configuration
 * - graphql/core.ts - Core GraphQL request function
 * - graphql/types/ - TypeScript type definitions
 * - graphql/fragments/ - Reusable GraphQL field fragments
 * - graphql/queries/ - Query functions organized by domain
 * - graphql/mutations/ - Mutation functions organized by domain
 * - graphql/utils/ - Helper utility functions
 */

// ==================== CORE EXPORTS ====================
export { graphqlRequest } from './graphql/core';
export { GRAPHQL_ENDPOINT } from './graphql/config';

// ==================== TYPE EXPORTS ====================
export type {
  CreateHouseholdInput,
  UpdateHouseholdInput,
  Household,
  UpdateProfileInput,
  Profile,
  Chore,
  ChoreAssignment,
  CreateChoreInput,
  UpdateChoreInput,
  CreateChoreAssignmentInput,
  CompleteChoreAssignmentInput,
  CreateExpenseInput,
  UpdateExpenseInput,
  MarkExpensePaidInput,
  GeneratePaymentURLInput,
  Expense,
  ExpenseSplit,
  PaymentURLResult,
} from './graphql/types';

// ==================== QUERY EXPORTS ====================
export {
  getMyHouseholds,
  getHousehold,
  listHouseholds,
} from './graphql/queries/households';

export {
  getMyChoreAssignments,
  getHouseholdChores,
  getHouseholdChoreAssignments,
} from './graphql/queries/chores';

export {
  getMyExpenses,
  getHouseholdExpenses,
  getExpenseSplits,
  getExpense,
} from './graphql/queries/expenses';

// ==================== MUTATION EXPORTS ====================
export {
  createHousehold,
  updateHousehold,
  deleteHousehold,
  joinHousehold,
  leaveHousehold,
} from './graphql/mutations/households';

export {
  updateProfile,
} from './graphql/mutations/profiles';

export {
  createExpense,
  updateExpense,
  deleteExpense,
  markExpensePaid,
  generatePaymentURL,
} from './graphql/mutations/expenses';

// ==================== HELPER EXPORTS ====================
export {
  hasHousehold,
  getCurrentHousehold,
} from './graphql/utils/helpers';
