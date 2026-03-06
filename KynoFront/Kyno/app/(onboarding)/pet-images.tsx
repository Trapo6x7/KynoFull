import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/src/constants/colors';
import ImagePlaceholder from '@/src/components/ImagePlaceholder';
import keywordService, { Keyword } from '@/src/services/keywordService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeywordPickerModal } from '@/src/components/onboarding/KeywordPickerModal';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 80) / 3;

export default function PetImagesScreen() {
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [availableKeywords, setAvailableKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showKeywordPicker, setShowKeywordPicker] = useState(false);
  const [loadingKeywords, setLoadingKeywords] = useState(true);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      const data = await keywordService.getKeywordsByCategory('dog');
      setAvailableKeywords(data);
    } catch (error) {
      console.error('Erreur lors du chargement des mots-cles:', error);
    } finally {
      setLoadingKeywords(false);
    }
  };

  if (!fontsLoaded) return null;

  const pickImage = async (index: number) => {
    const mediaTypes = (ImagePicker as any).MediaType?.Images
      ?? (ImagePicker as any).MediaTypeOptions?.Images
      ?? 'Images';

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const toggleKeyword = (keywordName: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keywordName) ? prev.filter(k => k !== keywordName) : [...prev, keywordName]
    );
  };

  const removeKeyword = (keyword: string) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
  };

  const handleNext = () => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('onboarding');
        const onboarding = stored ? JSON.parse(stored) : {};
        onboarding.petImages = images.filter(Boolean);
        onboarding.petKeywords = selectedKeywords;
        await AsyncStorage.setItem('onboarding', JSON.stringify(onboarding));
      } catch (e) {
        console.error('Erreur sauvegarde onboarding (pet-images):', e);
      } finally {
        router.push('/(onboarding)/location');
      }
    })();
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
        <Text style={styles.title}>Ajouter Des Images</Text>
        <Text style={styles.subtitle}>
          Souris, c'est l'heure du portrait ! Ajoute une photo adorable de ton chien.
        </Text>

        <View style={styles.imageGrid}>
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imageBox}
              onPress={() => pickImage(index)}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <ImagePlaceholder size={IMAGE_SIZE * 0.6} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mots Cles</Text>
          <TouchableOpacity
            style={styles.keywordButton}
            onPress={() => setShowKeywordPicker(true)}
            disabled={loadingKeywords}
          >
            <Text style={styles.keywordButtonText}>
              {loadingKeywords ? 'Chargement...' : 'Selectionner des mots-cles'}
            </Text>
            <Text style={styles.keywordButtonIcon}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {selectedKeywords.map((keyword, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{keyword}</Text>
              <TouchableOpacity onPress={() => removeKeyword(keyword)}>
                <Text style={styles.tagRemove}>x</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, selectedKeywords.length < 3 && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={selectedKeywords.length < 3}
        >
          <Text style={styles.buttonText}>
            {selectedKeywords.length < 3
              ? `Selectionnez ${3 - selectedKeywords.length} mot(s) de plus`
              : 'SUIVANT'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeywordPickerModal
        visible={showKeywordPicker}
        title="Selectionnez les mots-cles de votre chien"
        keywords={availableKeywords}
        selectedKeywords={selectedKeywords}
        loadingKeywords={loadingKeywords}
        onToggle={toggleKeyword}
        onClose={() => setShowKeywordPicker(false)}
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
  title: {
    fontSize: 22,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
    marginBottom: 25,
    lineHeight: 18,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  imageBox: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: Colors.grayDark,
    marginBottom: 8,
  },
  keywordButton: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keywordButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.gray,
  },
  keywordButtonIcon: {
    fontSize: 20,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.buttonPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: Colors.grayDark,
  },
  tagRemove: {
    fontSize: 10,
    color: Colors.grayDark,
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    letterSpacing: 1,
  },
});
