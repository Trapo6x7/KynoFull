import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import api from '@/src/services/api';
import { useAuth } from '@/src/context/AuthContext';

export default function VerifyTokenScreen() {
  const { token } = useLocalSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification en cours...');

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant');
      return;
    }

    try {
      await api.post('/emails/verify-token', { token });
      setStatus('success');
      setMessage('Email vérifié avec succès !');
      
      // Rafraîchir les données utilisateur
      await refreshUser();
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        router.replace('/(tabs)/explore');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Erreur lors de la vérification. Le lien est peut-être expiré.'
      );
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color={Colors.buttonPrimary} />
            <Text style={styles.message}>{message}</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success || '#4CAF50'} />
            <Text style={styles.title}>Succès !</Text>
            <Text style={styles.message}>{message}</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Ionicons name="close-circle" size={80} color={Colors.primaryDark} />
            <Text style={styles.title}>Erreur</Text>
            <Text style={styles.message}>{message}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
    textAlign: 'center',
    marginTop: 20,
  },
});
