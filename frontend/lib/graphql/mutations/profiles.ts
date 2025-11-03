import { graphqlRequest } from '../core';
import { PROFILE_FIELDS } from '../fragments';
import { Profile, UpdateProfileInput } from '../types';

/**
 * Update profile mutation
 */
const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    profiles {
      updateProfile(input: $input) {
        ${PROFILE_FIELDS}
      }
    }
  }
`;

export async function updateProfile(input: UpdateProfileInput): Promise<Profile | null> {
  const result = await graphqlRequest<{ profiles: { updateProfile: Profile } }>(
    UPDATE_PROFILE_MUTATION,
    { input }
  );

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to update profile');
  }

  return result.data?.profiles?.updateProfile || null;
}
