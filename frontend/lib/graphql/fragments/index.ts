/**
 * GraphQL field fragments for reuse across queries and mutations
 */

export const HOUSEHOLD_FIELDS = `
  id
  name
  description
  address
  rentAmount
  currency
  householdType
  amenities
  images
  isAvailable
  createdBy
  inviteCode
  roommates {
    id
    userId
    profile {
      id
      fullName
      avatarUrl
      bio
    }
    points
  }
  createdAt
  updatedAt
`;

export const PROFILE_FIELDS = `
  id
  fullName
  avatarUrl
  bio
  venmoHandle
  paypalEmail
  cashappHandle
  zelleEmail
  preferredPaymentMethod
  createdAt
  updatedAt
`;

export const CHORE_FIELDS = `
  id
  householdId
  title
  description
  recurrence
  points
  requiresProof
  createdBy
  createdAt
  updatedAt
`;

export const CHORE_ASSIGNMENT_FIELDS = `
  id
  chore {
    ${CHORE_FIELDS}
  }
  user {
    ${PROFILE_FIELDS}
  }
  dueDate
  isComplete
  completedAt
  proofUrl
  createdAt
`;

export const EXPENSE_FIELDS = `
  id
  householdId
  title
  description
  amount
  currency
  category
  paidBy
  createdAt
  dueDate
`;

export const EXPENSE_SPLIT_FIELDS = `
  id
  expenseId
  userId
  amount
  isPaid
  paidAt
`;
