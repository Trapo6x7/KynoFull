import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/context/AuthContext';
import { ServicesProvider } from '@/src/context/ServicesContext';

function AppGradient({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const isAuthOrOnboarding = segments[0] === '(auth)' || segments[0] === '(onboarding)';

  if (isAuthOrOnboarding) {
    return <>{children}</>;
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#fdf0f5', '#fce4ec']}
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <ServicesProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppGradient>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                contentStyle: { backgroundColor: 'transparent' },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
            </Stack>
          </AppGradient>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </ServicesProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
