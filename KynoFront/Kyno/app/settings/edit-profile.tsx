import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsLayout from '@/src/components/SettingsLayout';

import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';
import Colors from '@/src/constants/colors';
import keywordService, { Keyword } from '@/src/services/keywordService';
import { KeywordPickerModal } from '@/src/components/onboarding/KeywordPickerModal';

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

  useEffect(() => {
    keywordService.getKeywordsByCategory('user').then(setAvailableKeywords).catch(() => {});
  }, []);

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

  return (
    <SettingsLayout title="Modifier mon profil">
      <StatusBar barStyle="dark-content" />
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
                  <Ionicons name="close" size={14} color={Colors.white} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bouton Enregistrer */}
      <View style={styles.saveContainer}>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} activeOpacity={0.8} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>ENREGISTRER</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Keyword picker modal */}
      <KeywordPickerModal
        visible={showKeywordPicker}
        title="Choisir des mots-clés"
        keywords={availableKeywords}
        selectedKeywords={selectedKeywords}
        loadingKeywords={false}
        onToggle={toggleKeyword}
        onClose={() => setShowKeywordPicker(false)}
      />
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  saveContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.grayDark,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 1,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.black ?? '#222',
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
    backgroundColor: Colors.white,
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
    color: Colors.white,
    fontWeight: '600',
  },
});
