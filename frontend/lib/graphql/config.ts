import { Platform } from 'react-native';

/**
 * GraphQL API endpoint configuration
 * For React Native:
 * - iOS Simulator: localhost works
 * - Android Emulator: use 10.0.2.2
 * - Physical Device: use your computer's IP address (e.g., 192.168.1.100)
 */
const getGraphQLEndpoint = () => {
  return "http://169.233.154.30:8000/graphql";
};

export const GRAPHQL_ENDPOINT = getGraphQLEndpoint();
