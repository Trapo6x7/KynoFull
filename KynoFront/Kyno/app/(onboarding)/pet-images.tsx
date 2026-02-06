import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/src/constants/colors';
import ImagePlaceholder from '@/src/components/ImagePlaceholder';
import keywordService, { Keyword } from '@/src/services/keywordService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 80) / 3;

export default function PetImagesScreen() {
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [availableKeywords, setAvailableKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showKeywordPicker, setShowKeywordPicker] = useState(false);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    loadKeywords();
  }, []);

  useEffect(() => {
    if (showKeywordPicker) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showKeywordPicker]);

  const loadKeywords = async () => {
    try {
      const data = await keywordService.getKeywordsByCategory('dog');
      setAvailableKeywords(data);
    } catch (error) {
      console.error('Erreur lors du chargement des mots-clés:', error);
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
    if (selectedKeywords.includes(keywordName)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keywordName));
    } else {
      setSelectedKeywords([...selectedKeywords, keywordName]);
    }
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
        {/* Titre */}
        <Text style={styles.title}>Ajouter Des Images</Text>
        <Text style={styles.subtitle}>
          Souris, c'est l'heure du portrait ! Ajoute une photo adorable de ton chien.
        </Text>

        {/* Grille d'images */}
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

        {/* Mots Clés */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mots Clés</Text>
          <TouchableOpacity 
            style={styles.keywordButton}
            onPress={() => setShowKeywordPicker(true)}
            disabled={loadingKeywords}
          >
            <Text style={styles.keywordButtonText}>
              {loadingKeywords ? 'Chargement...' : 'Sélectionner des mots-clés'}
            </Text>
            <Text style={styles.keywordButtonIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {selectedKeywords.map((keyword, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{keyword}</Text>
              <TouchableOpacity onPress={() => removeKeyword(keyword)}>
                <Text style={styles.tagRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bouton Suivant */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.button,
            selectedKeywords.length < 3 && styles.buttonDisabled
          ]} 
          onPress={handleNext}
          disabled={selectedKeywords.length < 3}
        >
          <Text style={styles.buttonText}>
            {selectedKeywords.length < 3 
              ? `Sélectionnez ${3 - selectedKeywords.length} mot(s) de plus` 
              : 'SUIVANT'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Keyword Picker */}
      <Modal
        visible={showKeywordPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowKeywordPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowKeywordPicker(false)}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  })
                }]
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Sélectionnez les mots-clés de votre chien</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableKeywords && availableKeywords.length > 0 ? (
                availableKeywords.map((keyword) => (
                  <TouchableOpacity
                    key={keyword.id}
                    style={[
                      styles.modalOption,
                      selectedKeywords.includes(keyword.name) && styles.modalOptionSelected
                    ]}
                    onPress={() => toggleKeyword(keyword.name)}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      selectedKeywords.includes(keyword.name) && styles.modalOptionTextSelected
                    ]}>
                      {keyword.name}
                    </Text>
                    {selectedKeywords.includes(keyword.name) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.placeholderText}>Chargement des mots-clés...</Text>
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowKeywordPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </Animated.View>
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
  cameraIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconText: {
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
    height: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionSelected: {
    backgroundColor: Colors.backgroundLight,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
  },
  modalOptionTextSelected: {
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
  },
  modalCloseButton: {
    paddingVertical: 12,
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.gray,
    textAlign: 'center',
    paddingVertical: 20,
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
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    letterSpacing: 1,
  },
});
