import { graphqlRequest } from '../core';
import { HOUSEHOLD_FIELDS } from '../fragments';
import { Household, CreateHouseholdInput, UpdateHouseholdInput } from '../types';

/**
 * Create household mutation
 */
const CREATE_HOUSEHOLD_MUTATION = `
  mutation CreateHousehold($input: CreateHouseholdInput!) {
    households {
      createHousehold(input: $input) {
        ${HOUSEHOLD_FIELDS}
      }
    }
  }
`;

export async function createHousehold(input: CreateHouseholdInput): Promise<Household | null> {
  const result = await graphqlRequest<{ households: { createHousehold: Household } }>(
    CREATE_HOUSEHOLD_MUTATION,
    { input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to create household');
  }

  return result.data?.households?.createHousehold || null;
}

/**
 * Update household mutation
 */
const UPDATE_HOUSEHOLD_MUTATION = `
  mutation UpdateHousehold($householdId: String!, $input: UpdateHouseholdInput!) {
    households {
      updateHousehold(householdId: $householdId, input: $input) {
        ${HOUSEHOLD_FIELDS}
      }
    }
  }
`;

export async function updateHousehold(
  householdId: string,
  input: UpdateHouseholdInput
): Promise<Household | null> {
  const result = await graphqlRequest<{ households: { updateHousehold: Household } }>(
    UPDATE_HOUSEHOLD_MUTATION,
    { householdId, input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to update household');
  }

  return result.data?.households?.updateHousehold || null;
}

/**
 * Delete household mutation
 */
const DELETE_HOUSEHOLD_MUTATION = `
  mutation DeleteHousehold($householdId: String!) {
    households {
      deleteHousehold(householdId: $householdId)
    }
  }
`;

export async function deleteHousehold(householdId: string): Promise<boolean> {
  const result = await graphqlRequest<{ households: { deleteHousehold: boolean } }>(
    DELETE_HOUSEHOLD_MUTATION,
    { householdId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to delete household');
  }

  return result.data?.households?.deleteHousehold || false;
}

/**
 * Join household mutation
 */
const JOIN_HOUSEHOLD_MUTATION = `
  mutation JoinHousehold($inviteCode: String!) {
    households {
      joinHousehold(inviteCode: $inviteCode) {
        ${HOUSEHOLD_FIELDS}
      }
    }
  }
`;

export async function joinHousehold(inviteCode: string): Promise<Household | null> {
  const result = await graphqlRequest<{ households: { joinHousehold: Household } }>(
    JOIN_HOUSEHOLD_MUTATION,
    { inviteCode }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to join household');
  }

  return result.data?.households?.joinHousehold || null;
}

/**
 * Leave household mutation
 */
const LEAVE_HOUSEHOLD_MUTATION = `
  mutation LeaveHousehold($householdId: String!) {
    households {
      leaveHousehold(householdId: $householdId) {
        success
        remainingHouseholds {
          id
          name
          description
          address
          rentAmount
          inviteCode
          isAvailable
          createdAt
          updatedAt
        }
      }
    }
  }
`;

interface LeaveHouseholdResult {
  success: boolean;
  remainingHouseholds: Household[];
}

export async function leaveHousehold(householdId: string): Promise<LeaveHouseholdResult> {
  const result = await graphqlRequest<{ 
    households: { 
      leaveHousehold: LeaveHouseholdResult 
    } 
  }>(
    LEAVE_HOUSEHOLD_MUTATION,
    { householdId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to leave household');
  }

  return result.data?.households?.leaveHousehold || { success: false, remainingHouseholds: [] };
}
