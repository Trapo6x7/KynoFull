import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';
import Colors from '@/src/constants/colors';
import keywordService, { Keyword } from '@/src/services/keywordService';

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { authService } = useServices();

  const [firstName, setFirstName] = useState(user?.name ?? user?.firstName ?? '');
  const [description, setDescription] = useState(user?.description ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [profession, setProfession] = useState(user?.profession ?? '');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(user?.keywords ?? []);

  const [availableKeywords, setAvailableKeywords] = useState<Keyword[]>([]);
  const [showKeywordPicker, setShowKeywordPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    keywordService.getKeywordsByCategory('user').then(setAvailableKeywords).catch(() => {});
  }, []);

  useEffect(() => {
    if (showKeywordPicker) {
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
  }, [showKeywordPicker]);

  const toggleKeyword = (name: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(name) ? prev.filter((k) => k !== name) : [...prev, name],
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await authService.updateUser(user.id, {
        name: firstName,
        description,
        city,
        profession,
        keywords: selectedKeywords,
      });
      await refreshUser();
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  const slideStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier mon profil</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} activeOpacity={0.7} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Prénom */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Votre nom"
            placeholderTextColor={Colors.gray}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Parlez-vous de vous..."
            placeholderTextColor={Colors.gray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.charCount}>{description.length}/300</Text>
        </View>

        {/* Ville */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ville</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Votre ville"
            placeholderTextColor={Colors.gray}
          />
        </View>

        {/* Profession */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Profession</Text>
          <TextInput
            style={styles.input}
            value={profession}
            onChangeText={setProfession}
            placeholder="Votre profession"
            placeholderTextColor={Colors.gray}
          />
        </View>

        {/* Mots-clés */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Mots-clés</Text>
          <TouchableOpacity
            style={styles.keywordButton}
            onPress={() => setShowKeywordPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.keywordButtonText}>Sélectionner des mots-clés</Text>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          {selectedKeywords.length > 0 && (
            <View style={styles.tagsContainer}>
              {selectedKeywords.map((kw) => (
                <TouchableOpacity
                  key={kw}
                  style={styles.tag}
                  onPress={() => toggleKeyword(kw)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagText}>{kw}</Text>
                  <Ionicons name="close" size={14} color={Colors.primaryDark} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Keyword picker modal */}
      <Modal visible={showKeywordPicker} transparent animationType="none" onRequestClose={() => setShowKeywordPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowKeywordPicker(false)}>
          <Animated.View style={[styles.pickerSheet, slideStyle]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Choisir des mots-clés</Text>
                <TouchableOpacity onPress={() => setShowKeywordPicker(false)}>
                  <Ionicons name="close" size={22} color={Colors.grayDark} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.keywordsGrid}>
                  {availableKeywords.map((kw) => {
                    const selected = selectedKeywords.includes(kw.name);
                    return (
                      <TouchableOpacity
                        key={kw.id}
                        style={[styles.kwChip, selected && styles.kwChipSelected]}
                        onPress={() => toggleKeyword(kw.name)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.kwChipText, selected && styles.kwChipTextSelected]}>
                          {kw.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
              <TouchableOpacity style={styles.pickerDoneBtn} onPress={() => setShowKeywordPicker(false)} activeOpacity={0.8}>
                <Text style={styles.pickerDoneBtnText}>Valider</Text>
              </TouchableOpacity>
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
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark ?? '#222',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20, paddingBottom: 40 },

  fieldGroup: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayDark ?? '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textDark ?? '#222',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },

  keywordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  keywordButtonText: {
    fontSize: 15,
    color: Colors.gray,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '600',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark ?? '#222',
  },
  pickerScroll: { maxHeight: 340 },
  keywordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },
  kwChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.grayLight,
  },
  kwChipSelected: {
    backgroundColor: Colors.buttonPrimary,
  },
  kwChipText: {
    fontSize: 14,
    color: Colors.grayDark ?? '#555',
  },
  kwChipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  pickerDoneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  pickerDoneBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
