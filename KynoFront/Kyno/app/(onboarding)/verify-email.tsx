import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import emailService from '@/src/services/emailService';
import { useAuth } from '@/src/context/AuthContext';

const { width } = Dimensions.get('window');

export default function VerifyEmailScreen() {
  const { user, refreshUser } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    sendInitialEmail();
  }, []);

  const sendInitialEmail = async () => {
    if (!user?.email || emailSent) return;
    
    try {
      console.log('Envoi email de vérification pour:', user.email);
      await emailService.sendVerificationEmail(user.email);
      setEmailSent(true);
      console.log('Email de vérification envoyé');
    } catch (error: any) {
      console.error('Erreur envoi email:', error);
    }
  };

  if (!fontsLoaded) return null;

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1]; // Prend seulement le dernier caractère
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus sur le champ suivant
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Vérifier automatiquement si tous les champs sont remplis
    if (newCode.every(digit => digit !== '') && !isVerifying) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (verificationCode?: string) => {
    if (!user?.email) return;

    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 6 chiffres');
      return;
    }

    try {
      setIsVerifying(true);
      await emailService.verifyCode(user.email, codeToVerify);
      await refreshUser();
      
      Alert.alert('Succès', 'Email vérifié avec succès !', [
        {
          text: 'OK',
          onPress: () => {
            // Rediriger vers onboarding ou tabs selon is_complete
            if (user.is_complete) {
              router.replace('/(tabs)/explore');
            } else {
              router.replace('/(onboarding)/your-detail');
            }
          }
        }
      ]);
    } catch (error: any) {
      console.error('Erreur vérification code:', error);
      const message = error.response?.data?.error || 'Code invalide ou expiré';
      Alert.alert('Erreur', message);
      // Réinitialiser le code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    try {
      setIsResending(true);
      console.log('Renvoi email pour:', user.email);
      await emailService.resendVerificationEmail(user.email);
      console.log('Email renvoyé avec succès');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Email envoyé', 'Un nouveau code a été envoyé à votre adresse email.');
    } catch (error: any) {
      console.error('Erreur renvoi email:', error);
      Alert.alert('Erreur', 'Impossible de renvoyer l\'email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Vérification</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/dogillustration1.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Vérifie ton email</Text>
        
        <Text style={styles.description}>
          On a envoyé un code à 6 chiffres à{' '}
          <Text style={styles.email}>{user?.email}</Text>
        </Text>

        <Text style={styles.instruction}>
          Entre le code ci-dessous pour rejoindre la meute !
        </Text>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : null,
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isVerifying}
            />
          ))}
        </View>

        {isVerifying && (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        )}
      </ScrollView>

      {/* Footer avec boutons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendEmail}
          disabled={isResending}
        >
          {isResending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.resendText}>Renvoyer le code</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  illustration: {
    width: width * 0.5,
    height: width * 0.5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.black,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  email: {
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.black,
  },
  instruction: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.grayLight,
    borderRadius: 12,
    fontSize: 24,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center',
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    paddingBottom: 35,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.black,
    letterSpacing: 1,
  },
  resendButton: {
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
