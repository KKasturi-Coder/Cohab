import { graphqlRequest } from '../core';
import { HOUSEHOLD_FIELDS } from '../fragments';
import { Household } from '../types';

/**
 * Get my households query
 */
const MY_HOUSEHOLDS_QUERY = `
  query MyHouseholds {
    households {
      myHouseholds {
        ${HOUSEHOLD_FIELDS}
      }
    }
  }
`;

export async function getMyHouseholds(): Promise<Household[]> {
  const result = await graphqlRequest<{ households: { myHouseholds: Household[] } }>(
    MY_HOUSEHOLDS_QUERY
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch households');
  }

  return result.data?.households?.myHouseholds || [];
}

/**
 * Get household by ID
 */
const GET_HOUSEHOLD_QUERY = `
  query GetHousehold($householdId: String!) {
    households {
      household(householdId: $householdId) {
        ${HOUSEHOLD_FIELDS}
      }
    }
  }
`;

export async function getHousehold(householdId: string): Promise<Household | null> {
  const result = await graphqlRequest<{ households: { household: Household } }>(
    GET_HOUSEHOLD_QUERY,
    { householdId }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch household');
  }

  return result.data?.households?.household || null;
}

/**
 * List all households
 */
const LIST_HOUSEHOLDS_QUERY = `
  query ListHouseholds($availableOnly: Boolean, $limit: Int) {
    households {
      list(availableOnly: $availableOnly, limit: $limit) {
        ${HOUSEHOLD_FIELDS}
      }
    }
  }
`;

export async function listHouseholds(
  availableOnly: boolean = false,
  limit: number = 10
): Promise<Household[]> {
  const result = await graphqlRequest<{ households: { list: Household[] } }>(
    LIST_HOUSEHOLDS_QUERY,
    { availableOnly, limit }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to list households');
  }

  return result.data?.households?.list || [];
}
