import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsLayout from '@/src/components/SettingsLayout';
import Colors from '@/src/constants/colors';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 1,
    question: 'Comment créer un compte ?',
    answer:
      "Téléchargez l'application, appuyez sur « Créer un compte », renseignez votre email et un mot de passe, puis validez votre adresse email via le lien reçu.",
  },
  {
    id: 2,
    question: 'Comment ajouter mon chien ?',
    answer:
      "Depuis votre profil, appuyez sur « Ajouter un chien », renseignez son nom, sa race, sa taille et sa photo. Vous pouvez ajouter plusieurs chiens.",
  },
  {
    id: 3,
    question: "Comment fonctionne le matching ?",
    answer:
      "L'algorithme de matching prend en compte votre localisation, les préférences de taille et de race, l'âge et le genre du maître et du chien que vous avez configurés dans vos paramètres.",
  },
  {
    id: 4,
    question: 'Puis-je modifier mes préférences de match ?',
    answer:
      "Oui, rendez-vous dans Paramètres → Paramètres de match pour ajuster la distance, les tranches d'âge, le genre et les préférences de votre chien.",
  },
  {
    id: 5,
    question: 'Comment signaler un utilisateur ?',
    answer:
      "Sur la fiche profil d'un utilisateur, appuyez sur les trois points en haut à droite puis sur « Signaler ». Notre équipe examinera le signalement sous 24 h.",
  },
  {
    id: 6,
    question: 'Comment supprimer mon compte ?',
    answer:
      "Contactez notre support à support@kyno.app en précisant votre email. La suppression est définitive et sera traitée dans un délai de 7 jours.",
  },
  {
    id: 7,
    question: "L'application est-elle gratuite ?",
    answer:
      "Kyno est entièrement gratuit. Des fonctionnalités premium seront proposées prochainement sans modifier l'expérience de base.",
  },
];

export default function FaqScreen() {
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(FAQ_DATA[0].id);

  const filtered = FAQ_DATA.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SettingsLayout title="FAQ">
      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={Colors.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Commencer a rechercher..."
          placeholderTextColor={Colors.gray}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>Aucun résultat pour "{search}"</Text>
        )}
        {filtered.map((item) => {
          const isOpen = openId === item.id;
          return (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggle(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.question, isOpen && styles.questionOpen]}>
                  {item.question}
                </Text>
                <Ionicons
                  name={isOpen ? 'remove' : 'add'}
                  size={22}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              {isOpen && (
                <Text style={styles.answer}>{item.answer}</Text>
              )}
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 30,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.grayDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: 14,
    marginTop: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grayDark,
    paddingRight: 8,
    lineHeight: 20,
  },
  questionOpen: {
    color: Colors.grayDark,
  },
  answer: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 20,
  },
});
