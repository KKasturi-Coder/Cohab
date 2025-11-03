import { getMyHouseholds } from '../queries/households';
import { Household } from '../types';

/**
 * Check if user has a household
 */
export async function hasHousehold(): Promise<boolean> {
  try {
    const households = await getMyHouseholds();
    return households.length > 0;
  } catch (error) {
    console.error('Error checking household status:', error);
    return false;
  }
}

/**
 * Get current user's active household
 */
export async function getCurrentHousehold(): Promise<Household | null> {
  try {
    const households = await getMyHouseholds();
    return households.length > 0 ? households[0] : null;
  } catch (error) {
    console.error('Error getting current household:', error);
    return null;
  }
}
