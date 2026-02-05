import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';
import { API_CONFIG } from '@/src/config/api';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [privateMode, setPrivateMode] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.images && user.images.length > 0 ? (
              <Image
                source={{ uri: `${API_CONFIG.BASE_URL}/uploads/images/${user.images[0]}` }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color={Colors.gray} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{user?.name}, {user?.birthdate ? new Date().getFullYear() - new Date(user.birthdate).getFullYear() : ''}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <View>
              <Text style={styles.menuTitle}>Paramètres de match</Text>
              <Text style={styles.menuSubtitle}>Gérer vos préférences de matching</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.black} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View>
              <Text style={styles.menuTitle}>Ma localisation</Text>
              <Text style={styles.menuSubtitle}>Modifier votre position</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.black} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View>
              <Text style={styles.menuTitle}>Editer profil</Text>
              <Text style={styles.menuSubtitle}>Modifier vos informations</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.black} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View>
              <Text style={styles.menuTitle}>Invitez des amis</Text>
              <Text style={styles.menuSubtitle}>Partagez l'application</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* Private Mode */}
        <View style={styles.section}>
          <View style={styles.menuItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Mode privé</Text>
              <Text style={styles.menuSubtitle}>Masquer votre profil</Text>
            </View>
            <Switch
              value={privateMode}
              onValueChange={setPrivateMode}
              trackColor={{ false: Colors.grayLight, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <View>
              <Text style={styles.menuTitle}>A propos</Text>
              <Text style={styles.menuSubtitle}>Informations sur l'application</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>DECONNEXION</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.primary,
    marginBottom: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.gray,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginVertical: 15,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
});
