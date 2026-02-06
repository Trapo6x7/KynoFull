import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import userService from '@/src/services/userService';

const { width } = Dimensions.get('window');

const GENRE_OPTIONS = [
  { label: 'Homme', value: 'homme' },
  { label: 'Femme', value: 'femme' },
  { label: 'Autre', value: 'autre' },
];

export default function YourDetailScreen() {
  const [genre, setGenre] = useState('');
  const [profession, setProfession] = useState('');
  const [description, setDescription] = useState('');
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [professions, setProfessions] = useState<string[]>([]);
  const [filteredProfessions, setFilteredProfessions] = useState<string[]>([]);
  const [showProfessionSuggestions, setShowProfessionSuggestions] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    loadProfessions();
  }, []);

  const loadProfessions = async () => {
    console.log('=== LOAD PROFESSIONS ===');
    try {
      console.log('Calling userService.getProfessions()');
      const data = await userService.getProfessions();
      console.log('Professions loaded:', data);
      setProfessions(data);
    } catch (error) {
      console.log('=== ERROR LOADING PROFESSIONS ===');
      console.log('Error:', error);
      console.log('Error message:', error.message);
      console.log('Error response:', error.response);
      setProfessions([]);
    }
  };

  const handleProfessionChange = (text: string) => {
    setProfession(text);
    if (text.length > 0) {
      const filtered = professions.filter(p => 
        p.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProfessions(filtered);
      setShowProfessionSuggestions(filtered.length > 0);
    } else {
      setShowProfessionSuggestions(false);
    }
  };

  const selectProfession = (prof: string) => {
    setProfession(prof);
    setShowProfessionSuggestions(false);
  };

  if (!fontsLoaded) return null;

  const handleNext = async () => {
    // Sauvegarder les données user dans AsyncStorage
    try {
      const stored = await AsyncStorage.getItem('onboarding');
      const onboarding = stored ? JSON.parse(stored) : {};
      onboarding.userDetails = {
        genre,
        profession,
        description,
      };
      await AsyncStorage.setItem('onboarding', JSON.stringify(onboarding));
    } catch (error) {
      console.error('Erreur sauvegarde détails user:', error);
    }
    router.push('/(onboarding)/your-images');
  };

  const getGenreLabel = () => {
    const option = GENRE_OPTIONS.find(opt => opt.value === genre);
    return option ? option.label : 'Sélectionnez un genre';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Votre profil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Genre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Genre</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowGenrePicker(true)}
          >
            <Text style={[styles.pickerButtonText, !genre && styles.placeholderText]}>
              {getGenreLabel()}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Profession */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Profession</Text>
          <TextInput
            style={styles.input}
            placeholder="Profession"
            placeholderTextColor={Colors.gray}
            value={profession}
            onChangeText={handleProfessionChange}
            onFocus={() => profession.length > 0 && setShowProfessionSuggestions(true)}
          />
          {showProfessionSuggestions && filteredProfessions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {filteredProfessions.slice(0, 5).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => selectProfession(item)}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="A propos de vous..."
            placeholderTextColor={Colors.gray}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Bouton Suivant */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>SUIVANT</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Genre Picker */}
      <Modal
        visible={showGenrePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenrePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowGenrePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez un genre</Text>
            {GENRE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  genre === option.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setGenre(option.value);
                  setShowGenrePicker(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  genre === option.value && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    backgroundColor: Colors.backgroundLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: Colors.grayDark,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
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
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: Colors.grayDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    borderWidth: 1,
    borderColor: Colors.grayLight,
    color: Colors.grayDark,
  },
  textArea: {
    height: 320,
    paddingTop: 14,
  },
  pickerButton: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
  },
  placeholderText: {
    color: Colors.gray,
  },
  footer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    paddingBottom: 35,
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    width: width * 0.8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: Colors.buttonPrimary,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: Colors.grayDark,
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    fontFamily: 'Manrope_600SemiBold',
  },
  suggestionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    marginTop: 1,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
  },
});
