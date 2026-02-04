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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import raceService from '@/src/services/raceService';
import type { Race } from '@/src/types';

const { width } = Dimensions.get('window');

const GENRE_OPTIONS = [
  { label: 'Mâle', value: 'male' },
  { label: 'Femelle', value: 'female' },
];

export default function PetDetailScreen() {
  const [name, setName] = useState('');
  const [raceId, setRaceId] = useState<number | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [genre, setGenre] = useState('');
  const [taille, setTaille] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [showRacePicker, setShowRacePicker] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  // Charger les races au montage du composant
  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = async () => {
    try {
      const data = await raceService.getRaces();
      setRaces(data);
    } catch (error) {
      console.error('Erreur lors du chargement des races:', error);
    } finally {
      setLoadingRaces(false);
    }
  };

  if (!fontsLoaded) return null;

  const handleNext = () => {
    router.push('/(onboarding)/pet-images');
  };

  const getGenreLabel = () => {
    const option = GENRE_OPTIONS.find(opt => opt.value === genre);
    return option ? option.label : 'Sélectionnez un genre';
  };

  const getRaceLabel = () => {
    if (!races || races.length === 0) return 'Sélectionnez une race';
    const selectedRace = races.find(r => r.id === raceId);
    return selectedRace ? selectedRace.name : 'Sélectionnez une race';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Votre ami(e) a poils</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            placeholderTextColor={Colors.gray}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Race */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Race</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowRacePicker(true)}
            disabled={loadingRaces}
          >
            {loadingRaces ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Text style={[styles.pickerButtonText, !raceId && styles.placeholderText]}>
                  {getRaceLabel()}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.gray} />
              </>
            )}
          </TouchableOpacity>
        </View>

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

        {/* Taille */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Taille</Text>
          <TextInput
            style={styles.input}
            placeholder="Taille"
            placeholderTextColor={Colors.gray}
            value={taille}
            onChangeText={setTaille}
          />
        </View>

        {/* Age */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor={Colors.gray}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="A propos de votre chien..."
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

      {/* Modal Race Picker */}
      <Modal
        visible={showRacePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRacePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowRacePicker(false)}
        >
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>Sélectionnez une race</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {races && races.length > 0 ? (
                races.map((race) => (
                  <TouchableOpacity
                    key={race.id}
                    style={[
                      styles.modalOption,
                      raceId === race.id && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      setRaceId(race.id);
                      setShowRacePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      raceId === race.id && styles.modalOptionTextSelected
                    ]}>
                      {race.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.placeholderText}>Chargement des races...</Text>
              )}
            </ScrollView>
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
    color: Colors.black,
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
    color: Colors.black,
  },
  textArea: {
    height: 120,
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
    color: Colors.black,
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
    color: Colors.black,
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
    color: Colors.black,
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
    color: Colors.black,
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    fontFamily: 'Manrope_600SemiBold',
  },
});
