// ==================== HOUSEHOLD TYPES ====================

export interface CreateHouseholdInput {
  name: string;
  description?: string;
  address?: string;
  rentAmount?: number;
  currency?: string;
  householdType?: string;
  amenities?: string[];
  images?: string[];
}

export interface UpdateHouseholdInput {
  name?: string;
  description?: string;
  address?: string;
  rentAmount?: number;
  currency?: string;
  householdType?: string;
  amenities?: string[];
  images?: string[];
  isAvailable?: boolean;
}

export interface Household {
  id: string;
  name: string;
  description?: string;
  address?: string;
  rentAmount?: number;
  currency?: string;
  householdType?: string;
  amenities?: string[];
  images?: string[];
  isAvailable: boolean;
  createdBy: string;
  inviteCode: string;
  roommates?: Roommate[];
  createdAt: string;
  updatedAt: string;
}

export interface Roommate {
  id: string;
  userId: string;
  profile: Profile;
  householdId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'left';
  joinedAt: string;
  leftAt?: string;
  points?: number;
}

// ==================== PROFILE TYPES ====================

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  venmoHandle?: string;
  paypalEmail?: string;
  cashappHandle?: string;
  zelleEmail?: string;
  preferredPaymentMethod?: 'venmo' | 'paypal' | 'cashapp' | 'zelle';
}

export interface Profile {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  venmoHandle?: string;
  paypalEmail?: string;
  cashappHandle?: string;
  zelleEmail?: string;
  preferredPaymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== CHORE TYPES ====================

export interface CreateChoreInput {
  householdId: string;
  title: string;
  description?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  points?: number;
  requiresProof?: boolean;
}

export interface UpdateChoreInput {
  title?: string;
  description?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  points?: number;
  requiresProof?: boolean;
}

export interface CreateChoreAssignmentInput {
  choreId: string;
  userId: string;
  dueDate: string;
}

export interface CompleteChoreAssignmentInput {
  assignmentId: string;
  proofUrl?: string;
}

export interface Chore {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  recurrence: string;
  points: number;
  requiresProof: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreAssignment {
  id: string;
  chore: Chore;
  user: Profile;
  dueDate: string;
  isComplete: boolean;
  completedAt?: string;
  proofUrl?: string;
  createdAt: string;
}

// ==================== EXPENSE TYPES ====================

export interface CreateExpenseInput {
  householdId: string;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  category?: 'rent' | 'utilities' | 'groceries' | 'cleaning' | 'maintenance' | 'other';
  dueDate?: string;
  splitWith: string[]; // Array of user IDs
}

export interface UpdateExpenseInput {
  title?: string;
  description?: string;
  amount?: number;
  currency?: string;
  category?: 'rent' | 'utilities' | 'groceries' | 'cleaning' | 'maintenance' | 'other';
  dueDate?: string;
}

export interface MarkExpensePaidInput {
  expenseSplitId: string;
}

export interface GeneratePaymentURLInput {
  expenseSplitId: string;
  paymentMethod?: 'venmo' | 'paypal' | 'cashapp' | 'zelle';
}

export interface Expense {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category?: string;
  paidBy: string;
  createdAt: string;
  dueDate?: string;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  paymentUrl?: string;
  paymentMethod?: string;
}

export interface PaymentURLResult {
  paymentUrl: string;
  paymentMethod: string;
  availableMethods: string[];
}
