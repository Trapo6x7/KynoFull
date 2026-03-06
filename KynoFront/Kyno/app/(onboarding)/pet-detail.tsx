import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import raceService from '@/src/services/raceService';
import type { Race } from '@/src/types';
import { OptionPickerModal, PickerOption } from '@/src/components/onboarding/OptionPickerModal';

const { width } = Dimensions.get('window');

const GENRE_OPTIONS: PickerOption[] = [
  { label: 'Male', value: 'male' },
  { label: 'Femelle', value: 'female' },
];

const SIZE_OPTIONS: PickerOption[] = [
  { label: 'Petit', value: 'small' },
  { label: 'Moyen', value: 'medium' },
  { label: 'Grand', value: 'large' },
];

const AGE_OPTIONS: PickerOption[] = Array.from({ length: 21 }, (_, i) => ({
  label: i === 0 ? "Moins d'1 an" : `${i} an${i > 1 ? 's' : ''}`,
  value: i.toString(),
}));

export default function PetDetailScreen() {
  const [name, setName] = useState('');
  const [raceId, setRaceId] = useState<number | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [genre, setGenre] = useState('');
  const [taille, setTaille] = useState('');
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [showRacePicker, setShowRacePicker] = useState(false);
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [raceOptions, setRaceOptions] = useState<PickerOption[]>([]);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = async () => {
    try {
      const data = await raceService.getRaces();
      setRaces(data);
      setRaceOptions(data.map(r => ({ label: r.name, value: String(r.id) })));
    } catch (error) {
      console.error('Erreur lors du chargement des races:', error);
    } finally {
      setLoadingRaces(false);
    }
  };

  if (!fontsLoaded) return null;

  const handleNext = () => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('onboarding');
        const onboarding = stored ? JSON.parse(stored) : {};
        onboarding.pet = { name, raceId, genre, taille, age, description };
        await AsyncStorage.setItem('onboarding', JSON.stringify(onboarding));
      } catch (e) {
        console.error('Erreur sauvegarde onboarding (pet-detail):', e);
      } finally {
        router.push('/(onboarding)/pet-images');
      }
    })();
  };

  const getGenreLabel = () => GENRE_OPTIONS.find(opt => opt.value === genre)?.label ?? 'Selectionnez un genre';
  const getTailleLabel = () => SIZE_OPTIONS.find(opt => opt.value === taille)?.label ?? 'Selectionnez une taille';
  const getRaceLabel = () => races.find(r => r.id === raceId)?.name ?? 'Selectionnez une race';
  const getAgeLabel = () => AGE_OPTIONS.find(opt => opt.value === age)?.label ?? "Selectionnez un age";

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
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowGenrePicker(true)}>
            <Text style={[styles.pickerButtonText, !genre && styles.placeholderText]}>
              {getGenreLabel()}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Taille */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Taille</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowSizePicker(true)}>
            <Text style={[styles.pickerButtonText, !taille && styles.placeholderText]}>
              {getTailleLabel()}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Age */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowAgePicker(true)}>
            <Text style={[styles.pickerButtonText, !age && styles.placeholderText]}>
              {getAgeLabel()}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.gray} />
          </TouchableOpacity>
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

      <OptionPickerModal
        visible={showGenrePicker}
        title="Selectionnez un genre"
        options={GENRE_OPTIONS}
        selectedValue={genre}
        onSelect={setGenre}
        onClose={() => setShowGenrePicker(false)}
      />
      <OptionPickerModal
        visible={showRacePicker}
        title="Selectionnez une race"
        options={raceOptions}
        selectedValue={String(raceId)}
        onSelect={(v) => setRaceId(Number(v))}
        onClose={() => setShowRacePicker(false)}
        scrollable
      />
      <OptionPickerModal
        visible={showSizePicker}
        title="Selectionnez la taille"
        options={SIZE_OPTIONS}
        selectedValue={taille}
        onSelect={setTaille}
        onClose={() => setShowSizePicker(false)}
      />
      <OptionPickerModal
        visible={showAgePicker}
        title="Selectionnez l'age"
        options={AGE_OPTIONS}
        selectedValue={age}
        onSelect={setAge}
        onClose={() => setShowAgePicker(false)}
        scrollable
      />
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
});
