import { graphqlRequest } from '../core';
import { CHORE_FIELDS, CHORE_ASSIGNMENT_FIELDS } from '../fragments';
import {
  Chore,
  ChoreAssignment,
  CreateChoreInput,
  UpdateChoreInput,
  CreateChoreAssignmentInput,
  CompleteChoreAssignmentInput,
} from '../types';

/**
 * Create chore mutation
 */
const CREATE_CHORE_MUTATION = `
  mutation CreateChore($input: CreateChoreInput!) {
    chores {
      createChore(input: $input) {
        ${CHORE_FIELDS}
      }
    }
  }
`;

export async function createChore(input: CreateChoreInput): Promise<Chore | null> {
  const result = await graphqlRequest<{ chores: { createChore: Chore } }>(
    CREATE_CHORE_MUTATION,
    { input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to create chore');
  }

  return result.data?.chores?.createChore || null;
}

/**
 * Update chore mutation
 */
const UPDATE_CHORE_MUTATION = `
  mutation UpdateChore($choreId: String!, $input: UpdateChoreInput!) {
    chores {
      updateChore(choreId: $choreId, input: $input) {
        ${CHORE_FIELDS}
      }
    }
  }
`;

export async function updateChore(
  choreId: string,
  input: UpdateChoreInput
): Promise<Chore | null> {
  const result = await graphqlRequest<{ chores: { updateChore: Chore } }>(
    UPDATE_CHORE_MUTATION,
    { choreId, input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to update chore');
  }

  return result.data?.chores?.updateChore || null;
}

/**
 * Delete chore mutation
 */
const DELETE_CHORE_MUTATION = `
  mutation DeleteChore($choreId: String!) {
    chores {
      deleteChore(choreId: $choreId)
    }
  }
`;

export async function deleteChore(choreId: string): Promise<boolean> {
  const result = await graphqlRequest<{ chores: { deleteChore: boolean } }>(
    DELETE_CHORE_MUTATION,
    { choreId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to delete chore');
  }

  return result.data?.chores?.deleteChore || false;
}

/**
 * Create chore assignment mutation
 */
const CREATE_CHORE_ASSIGNMENT_MUTATION = `
  mutation CreateChoreAssignment($input: CreateChoreAssignmentInput!) {
    chores {
      createChoreAssignment(input: $input) {
        ${CHORE_ASSIGNMENT_FIELDS}
      }
    }
  }
`;

export async function createChoreAssignment(
  input: CreateChoreAssignmentInput
): Promise<ChoreAssignment | null> {
  const result = await graphqlRequest<{ chores: { createChoreAssignment: ChoreAssignment } }>(
    CREATE_CHORE_ASSIGNMENT_MUTATION,
    { input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to create chore assignment');
  }

  return result.data?.chores?.createChoreAssignment || null;
}

/**
 * Complete chore assignment mutation
 */
const COMPLETE_CHORE_ASSIGNMENT_MUTATION = `
  mutation CompleteChoreAssignment($input: CompleteChoreAssignmentInput!) {
    chores {
      completeChoreAssignment(input: $input) {
        ${CHORE_ASSIGNMENT_FIELDS}
      }
    }
  }
`;

export async function completeChoreAssignment(
  input: CompleteChoreAssignmentInput
): Promise<ChoreAssignment | null> {
  const result = await graphqlRequest<{ chores: { completeChoreAssignment: ChoreAssignment } }>(
    COMPLETE_CHORE_ASSIGNMENT_MUTATION,
    { input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to complete chore assignment');
  }

  return result.data?.chores?.completeChoreAssignment || null;
}

/**
 * Delete chore assignment mutation
 */
const DELETE_CHORE_ASSIGNMENT_MUTATION = `
  mutation DeleteChoreAssignment($assignmentId: String!) {
    chores {
      deleteChoreAssignment(assignmentId: $assignmentId)
    }
  }
`;

export async function deleteChoreAssignment(assignmentId: string): Promise<boolean> {
  const result = await graphqlRequest<{ chores: { deleteChoreAssignment: boolean } }>(
    DELETE_CHORE_ASSIGNMENT_MUTATION,
    { assignmentId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to delete chore assignment');
  }

  return result.data?.chores?.deleteChoreAssignment || false;
}
