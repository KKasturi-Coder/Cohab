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
}

export interface Profile {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
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
