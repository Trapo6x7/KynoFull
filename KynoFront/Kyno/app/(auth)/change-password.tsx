import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import Colors from '@/src/constants/colors';

const { width } = Dimensions.get('window');

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const validate = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'Le mot de passe est requis';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      // TODO: Appeler l'API pour changer le mot de passe
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Succès', 'Votre mot de passe a été modifié', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/Bgimage2.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Logo fixe en haut */}
      <View style={styles.headerContainer}>
        <Image
          source={require('@/assets/images/kynologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Titre fixe */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Rencontre &amp; <Text style={styles.titleAccent}>Joue</Text>
        </Text>
      </View>

      {/* Contenu scrollable */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Contenu */}
          <View style={styles.content}>

            {/* Formulaire */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.newPassword && styles.inputError]}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor={Colors.gray}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirmez votre nouveau mot de passe"
                  placeholderTextColor={Colors.gray}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.grayDark} />
                ) : (
                  <Text style={styles.buttonText}>WOOF !</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Retour */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    width: width * 0.35,
    height: 60,
  },
  titleContainer: {
    paddingHorizontal: 35,
    paddingBottom: 15,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
  },
  content: {
    paddingHorizontal: 35,
  },
  titleAccent: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope_600SemiBold',
    fontStyle: 'italic',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    borderWidth: 1,
    borderColor: Colors.grayLight,
    color: Colors.grayDark,
  },
  inputError: {
    borderColor: Colors.primaryDark,
  },
  errorText: {
    color: Colors.primaryDark,
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Manrope_400Regular',
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: Colors.grayDark,
    letterSpacing: 1,
  },
  backButton: {
    alignItems: 'center',
  },
  backText: {
    color: Colors.primaryDark,
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
});
