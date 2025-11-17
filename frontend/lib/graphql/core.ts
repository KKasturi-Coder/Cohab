import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { GRAPHQL_ENDPOINT } from './config';

/**
 * Generic GraphQL query/mutation executor
 */
export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<{ data?: T; errors?: any[] }> {
  try {
    // Get the current session token for authentication
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    console.log('GraphQL Request to:', GRAPHQL_ENDPOINT);

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('HTTP Error Response:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
    }

    return result;
  } catch (error: any) {
    console.error('GraphQL request failed:', error);
    console.error('Endpoint:', GRAPHQL_ENDPOINT);
    console.error('Platform:', Platform.OS);
    
    // Provide helpful error messages
    if (error.message === 'Network request failed') {
      const helpMessage = Platform.OS === 'android' 
        ? 'Network error. If using Android emulator, make sure backend is accessible at 10.0.2.2:8000. For physical device, set EXPO_PUBLIC_GRAPHQL_URL to your computer\'s IP address.'
        : `Network error. Make sure the backend is running at ${GRAPHQL_ENDPOINT}`;
      
      throw new Error(helpMessage);
    }
    
    throw error;
  }
}
