import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/src/context/AuthContext';
import { isProfileComplete } from '@/src/services/authService';
import SplashScreen from '@/src/screens/SplashScreen';

export default function Index() {
  // const [splashFinished, setSplashFinished] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Debug logs
  console.log('=== INDEX ROUTING ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('isLoading:', isLoading);
  // console.log('splashFinished:', splashFinished);
  console.log('user:', user);
  console.log('isProfileComplete:', user ? isProfileComplete(user) : 'N/A');
  
  // Afficher le splash tant que les données chargent
  if (isLoading) {
    console.log('→ Still loading...');
    return (
      <View style={styles.container}>
        <SplashScreen />
      </View>
    );
  }
  
  // Si l'utilisateur est connecté, router selon l'état de son profil
  if (isAuthenticated && user) {
    // Si le profil est complet (a au moins un chien), aller vers explore
    if (isProfileComplete(user)) {
      console.log('→ Redirecting to explore (profile complete)');
      return <Redirect href="/(tabs)/explore" />;
    }
    // Sinon, aller vers l'onboarding pour compléter le profil (commence par les détails utilisateur)
    console.log('→ Redirecting to onboarding (profile incomplete)');
    return <Redirect href="/(onboarding)/your-detail" />;
  }
  
  // Si pas authentifié, aller vers le login
  console.log('→ Redirecting to login (not authenticated)');
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
