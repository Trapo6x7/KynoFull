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
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useAuth } from '@/src/context/AuthContext';
import Colors from '@/src/constants/colors';
import LoadingScreen from '@/src/screens/LoadingScreen';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showLoading, setShowLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setShowLoading(true);
      const loggedInUser = await login({ email, password });
      
      // Attendre un peu pour que le loader soit visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Rediriger selon le statut de l'utilisateur
      if (!loggedInUser.isVerified) {
        // Email non vérifié -> écran de vérification
        router.replace('/(onboarding)/verify-email');
      } else if (!loggedInUser.is_complete) {
        // Profil incomplet -> onboarding
        router.replace('/(onboarding)/your-detail');
      } else {
        // Tout est OK -> accueil
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setShowLoading(false);
      Alert.alert(
        'Erreur de connexion',
        error.response?.data?.message || 'Email ou mot de passe incorrect'
      );
    }
  };

  // Afficher le loader après connexion réussie
  if (showLoading) {
    return <LoadingScreen />;
  }

  const handleGoogleLogin = () => {
    Alert.alert('À venir', 'Connexion Google bientôt disponible');
  };

  const handleFacebookLogin = () => {
    Alert.alert('À venir', 'Connexion Facebook bientôt disponible');
  };

  return (
    <ImageBackground
      source={require('@/assets/images/authBg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Bouton retour + Logo fixe en haut */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
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
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor={Colors.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Mot de passe"
                placeholderTextColor={Colors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={styles.buttonText}>WOOF !</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Séparateur */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Ou connectez vous</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Boutons sociaux */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
              <Text style={styles.facebookIcon}>f</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas de compte? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Inscrivez vous</Text>
            </TouchableOpacity>
          </View>
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
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    zIndex: 10,
    padding: 8,
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
    color: Colors.black,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    color: Colors.black,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: 5,
  },
  forgotPasswordText: {
    color: Colors.grayDark,
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
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
    color: Colors.black,
    letterSpacing: 1,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grayLight,
  },
  separatorText: {
    marginHorizontal: 15,
    color: Colors.gray,
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grayLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  facebookIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877F2',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.grayDark,
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },
  footerLink: {
    color: Colors.primaryDark,
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    textDecorationLine: 'underline',
  },
});
