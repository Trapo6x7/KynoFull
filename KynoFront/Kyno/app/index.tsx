import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import SplashScreen from '@/src/screens/SplashScreen';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Aucune redirection automatique
  }, [isLoading, splashDone, isAuthenticated, user, router]);

  // Keep showing the splash for all users
  if (isLoading || !splashDone) {
    return (
      <View style={styles.container}>
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </View>
    );
  }

  // Rester sur le splash même après l'animation
  return (
    <View style={styles.container}>
      <SplashScreen onFinish={() => setSplashDone(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
