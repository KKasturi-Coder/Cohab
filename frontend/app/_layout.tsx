import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding while loading fonts
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'LexendDeca_400Regular': require('@expo-google-fonts/lexend-deca').LexendDeca_400Regular,
    'LexendDeca_500Medium': require('@expo-google-fonts/lexend-deca').LexendDeca_500Medium,
    'LexendDeca_600SemiBold': require('@expo-google-fonts/lexend-deca').LexendDeca_600SemiBold,
    'LexendDeca_700Bold': require('@expo-google-fonts/lexend-deca').LexendDeca_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render until the fonts have loaded or there was an error
  if (!fontsLoaded && !fontError) {
    return null;
  }

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerBackTitle: '' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="signup" 
          options={{ 
            headerShown: false,
            animation: 'none'
          }} 
        />
        <Stack.Screen 
          name="signin" 
          options={({ navigation }) => ({ 
            headerShown: true,
            title: '',
            headerTransparent: true,
            headerTintColor: '#000000',
            presentation: 'card',
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{ 
                  paddingLeft: Platform.OS === 'ios' ? 8 : 16,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="chevron-back" size={28} color="#000000" />
              </TouchableOpacity>
            )
          })} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
