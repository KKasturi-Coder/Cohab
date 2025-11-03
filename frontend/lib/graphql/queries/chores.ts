import { graphqlRequest } from '../core';
import { CHORE_FIELDS, CHORE_ASSIGNMENT_FIELDS } from '../fragments';
import { Chore, ChoreAssignment } from '../types';

/**
 * Get household chores query
 */
const HOUSEHOLD_CHORES_QUERY = `
  query HouseholdChores($householdId: String!, $limit: Int) {
    chores {
      householdChores(householdId: $householdId, limit: $limit) {
        ${CHORE_FIELDS}
      }
    }
  }
`;

export async function getHouseholdChores(
  householdId: string,
  limit: number = 50
): Promise<Chore[]> {
  const result = await graphqlRequest<{ chores: { householdChores: Chore[] } }>(
    HOUSEHOLD_CHORES_QUERY,
    { householdId, limit }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch household chores');
  }

  return result.data?.chores?.householdChores || [];
}

/**
 * Get my chore assignments query
 */
const MY_CHORE_ASSIGNMENTS_QUERY = `
  query MyChoreAssignments($householdId: String!, $includeCompleted: Boolean, $limit: Int) {
    chores {
      myChoreAssignments(householdId: $householdId, includeCompleted: $includeCompleted, limit: $limit) {
        ${CHORE_ASSIGNMENT_FIELDS}
      }
    }
  }
`;

export async function getMyChoreAssignments(
  householdId: string,
  includeCompleted: boolean = false,
  limit: number = 50
): Promise<ChoreAssignment[]> {
  const result = await graphqlRequest<{ chores: { myChoreAssignments: ChoreAssignment[] } }>(
    MY_CHORE_ASSIGNMENTS_QUERY,
    { householdId, includeCompleted, limit }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch my chore assignments');
  }

  return result.data?.chores?.myChoreAssignments || [];
}

/**
 * Get household chore assignments query
 */
const HOUSEHOLD_CHORE_ASSIGNMENTS_QUERY = `
  query HouseholdChoreAssignments($householdId: String!, $includeCompleted: Boolean, $limit: Int) {
    chores {
      householdChoreAssignments(householdId: $householdId, includeCompleted: $includeCompleted, limit: $limit) {
        ${CHORE_ASSIGNMENT_FIELDS}
      }
    }
  }
`;

export async function getHouseholdChoreAssignments(
  householdId: string,
  includeCompleted: boolean = false,
  limit: number = 50
): Promise<ChoreAssignment[]> {
  const result = await graphqlRequest<{ chores: { householdChoreAssignments: ChoreAssignment[] } }>(
    HOUSEHOLD_CHORE_ASSIGNMENTS_QUERY,
    { householdId, includeCompleted, limit }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch household chore assignments');
  }

  return result.data?.chores?.householdChoreAssignments || [];
}
