import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import Colors from '@/src/constants/colors';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.firstName || 'Utilisateur'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={require('@/assets/images/kynoillustration.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Section Promenades à venir */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promenades à venir</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune promenade prévue</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Créer une promenade</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Mes chiens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes chiens</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucun chien enregistré</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Ajouter un chien</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Groupes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes groupes</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucun groupe rejoint</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Découvrir les groupes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: Colors.gray,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.grayDark,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: Colors.primaryLight,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayDark,
    marginBottom: 15,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
