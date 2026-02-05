import React, { useState } from "react";
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
  Modal,
} from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { useAuth } from "@/src/context/AuthContext";
import authService from "@/src/services/authService";
import Colors from "@/src/constants/colors";
import LoadingScreen from "@/src/screens/LoadingScreen";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const { register, isLoading, user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLoading, setShowLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!birthdate) {
      newErrors.birthdate = "La date de naissance est requise";
    } else {
      const age = new Date().getFullYear() - birthdate.getFullYear();
      if (age < 18) {
        newErrors.birthdate = "Vous devez avoir au moins 18 ans";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;
    setErrors({});
    setStep(2);
  };

  const handlePreviousStep = () => {
    setErrors({});
    setStep(1);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    try {
      setShowLoading(true);
      
      await register({
        email,
        password,
        name: firstName.trim(),
        birthdate: birthdate!.toISOString().split("T")[0],
      });
      
      // Rediriger vers l'onboarding
      setTimeout(() => {
        router.replace("/(onboarding)/your-detail");
      }, 500);
    } catch (error: any) {
      setShowLoading(false);
      console.log("=== ERREUR INSCRIPTION ===");
      console.log("Erreur complète:", JSON.stringify(error, null, 2));
      console.log("Message:", error.message);
      console.log("Réponse status:", error.response?.status);
      console.log(
        "Réponse data:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.log("Réponse headers:", error.response?.headers);
      console.log("========================");

      const message =
        error.response?.data?.violations?.[0]?.message ||
        error.response?.data?.message ||
        error.response?.data?.["hydra:description"] ||
        error.message ||
        "Une erreur est survenue lors de l'inscription";
      Alert.alert("Erreur d'inscription", message);
    }
  };

  // Afficher le loader après inscription réussie
  if (showLoading) {
    return <LoadingScreen />;
  }

  const handleGoogleRegister = () => {
    Alert.alert("À venir", "Inscription Google bientôt disponible");
  };

  const handleFacebookRegister = () => {
    Alert.alert("À venir", "Inscription Facebook bientôt disponible");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/authBg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Bouton retour + Logo fixe en haut */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => step === 1 ? router.back() : handlePreviousStep()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Image
          source={require("@/assets/images/kynologo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Indicateur d'étape */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step === 1 && styles.stepDotActive]} />
        <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Formulaire */}
            <View style={styles.form}>
              {step === 1 ? (
                // Étape 1: Email + Mot de passe
                <>
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
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        errors.password && styles.inputError,
                      ]}
                      placeholder="Mot de passe"
                      placeholderTextColor={Colors.gray}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        errors.confirmPassword && styles.inputError,
                      ]}
                      placeholder="Confirmer mot de passe"
                      placeholderTextColor={Colors.gray}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleNextStep}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>SUIVANT</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Étape 2: Prénom, Date de naissance, Ville
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        errors.firstName && styles.inputError,
                      ]}
                      placeholder="Prénom"
                      placeholderTextColor={Colors.gray}
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                    {errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.dateInputRow}>
                      <TextInput
                        style={[styles.input, styles.datePartInput, errors.birthdate && styles.inputError]}
                        placeholder="JJ"
                        placeholderTextColor={Colors.gray}
                        value={day}
                        onChangeText={(text) => {
                          if (text.length <= 2 && /^\d*$/.test(text)) {
                            setDay(text);
                            if (text.length === 2 && parseInt(text) >= 1 && parseInt(text) <= 31) {
                              // Auto-créer la date si tout est rempli
                              if (month && year) {
                                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(text));
                                setBirthdate(date);
                              }
                            }
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={styles.dateSeparator}>/</Text>
                      <TextInput
                        style={[styles.input, styles.datePartInput, errors.birthdate && styles.inputError]}
                        placeholder="MM"
                        placeholderTextColor={Colors.gray}
                        value={month}
                        onChangeText={(text) => {
                          if (text.length <= 2 && /^\d*$/.test(text)) {
                            setMonth(text);
                            if (text.length === 2 && parseInt(text) >= 1 && parseInt(text) <= 12) {
                              // Auto-créer la date si tout est rempli
                              if (day && year) {
                                const date = new Date(parseInt(year), parseInt(text) - 1, parseInt(day));
                                setBirthdate(date);
                              }
                            }
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={styles.dateSeparator}>/</Text>
                      <TextInput
                        style={[styles.input, styles.datePartInput, errors.birthdate && styles.inputError]}
                        placeholder="AAAA"
                        placeholderTextColor={Colors.gray}
                        value={year}
                        onChangeText={(text) => {
                          if (text.length <= 4 && /^\d*$/.test(text)) {
                            setYear(text);
                            if (text.length === 4) {
                              // Auto-créer la date si tout est rempli
                              if (day && month) {
                                const date = new Date(parseInt(text), parseInt(month) - 1, parseInt(day));
                                setBirthdate(date);
                              }
                            }
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>
                    {errors.birthdate && (
                      <Text style={styles.errorText}>{errors.birthdate}</Text>
                    )}
                  </View>

                  <View style={styles.buttonRow}>
                    {/* <TouchableOpacity
                      style={[styles.button, styles.buttonSecondary]}
                      onPress={handlePreviousStep}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.buttonTextSecondary}>RETOUR</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.buttonPrimary,
                        isLoading && styles.buttonDisabled,
                      ]}
                      onPress={handleRegister}
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
                </>
              )}
            </View>

            {/* Séparateur */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Ou inscrivez vous avec</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Boutons sociaux */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleRegister}
              >
                <Image
                  source={{ uri: "https://www.google.com/favicon.ico" }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookRegister}
              >
                <Text style={styles.facebookIcon}>f</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Déjà inscrit ? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.footerLink}>Connectez vous</Text>
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  backButton: {
    position: "absolute",
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
    fontFamily: "Manrope_600SemiBold",
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
    fontFamily: "Manrope_600SemiBold",
    fontStyle: "italic",
  },
  form: {
    marginBottom: 25,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 25,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.grayLight,
  },
  stepDotActive: {
    backgroundColor: Colors.buttonPrimary,
    width: 30,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  buttonPrimary: {
    flex: 1,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.buttonPrimary,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: Colors.buttonPrimary,
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  datePartInput: {
    flex: 1,
    textAlign: "center",
  },
  dateSeparator: {
    fontSize: 18,
    fontFamily: "Manrope_600SemiBold",
    color: Colors.gray,
  },
  cityInputContainer: {
    position: "relative",
  },
  cityInput: {
    paddingRight: 60,
  },
  locationButton: {
    position: "absolute",
    right: 0,
    top: 0,
    height: 48,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.buttonPrimary,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  locationIcon: {
    width: 24,
    height: 24,
    // tintColor: Colors.white,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    borderWidth: 1,
    borderColor: Colors.grayLight,
    color: Colors.black,
  },
  inputError: {
    borderColor: Colors.primaryDark,
  },
  errorText: {
    color: Colors.primaryDark,
    fontSize: 11,
    marginTop: 4,
    fontFamily: "Manrope_400Regular",
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
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
    fontFamily: "Manrope_700Bold",
    color: Colors.black,
    letterSpacing: 1,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    fontFamily: "Manrope_400Regular",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.grayLight,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#1877F2",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  footerText: {
    color: Colors.grayDark,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
  },
  footerLink: {
    color: Colors.primaryDark,
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    textDecorationLine: "underline",
  },
});
