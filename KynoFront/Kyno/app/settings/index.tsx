import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';
import { API_CONFIG } from '@/src/config/api';
import { getAge } from '@/src/utils/formatters';

const toImageUrl = (filename: string) =>
  `${API_CONFIG.BASE_URL}/uploads/images/${filename}`;

export default function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { authService } = useServices();
  const [privateMode, setPrivateMode] = useState(user?.privateMode ?? false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const COLLAPSE_AT = 70;

  const sectionHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_AT],
    outputRange: [210, 74],
    extrapolate: 'clamp',
  });
  // Single interpolation 0→1, both states derived from it → always sum to 1, zero flash
  const progress = scrollY.interpolate({
    inputRange: [0, COLLAPSE_AT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // expandedOpacity = 1 - progress, collapsedOpacity = progress
  // We can't subtract an Animated.Value directly, so we use separate interpolations
  // but with identical inputRange so they perfectly complement each other.
  const expandedOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_AT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const collapsedOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_AT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const displayName = user
    ? (user.firstName || user.lastName)
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : (user as any).name ?? ''
    : '';

  const userAge = user?.birthdate ? getAge(user.birthdate) : null;

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
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
      </View>

      {/* Profile Section — collapsible on scroll */}
      <Animated.View style={[styles.profileSection, { height: sectionHeight }]}>
        {/* Expanded: big centered image + name + email */}
        <Animated.View style={[styles.profileExpanded, { opacity: expandedOpacity }]}>
          <View style={styles.profileImageContainer}>
            {user?.images?.[0] ? (
              <Image source={{ uri: toImageUrl(user.images[0]) }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color={Colors.gray} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>
            {displayName || 'Utilisateur'}
            {userAge !== null && <Text>, {userAge} ans</Text>}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </Animated.View>

        {/* Collapsed: small image + name centered */}
        <Animated.View style={[styles.profileCollapsed, { opacity: collapsedOpacity }]}>
          <View style={styles.profileImageContainerSmall}>
            {user?.images?.[0] ? (
              <Image source={{ uri: toImageUrl(user.images[0]) }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={26} color={Colors.gray} />
              </View>
            )}
          </View>
          <Text style={styles.profileNameSmall}>
            {displayName || 'Utilisateur'}
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* Settings Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/match-settings')}>
            <View>
              <Text style={styles.menuTitle}>Paramètres de match</Text>
              <Text style={styles.menuSubtitle}>Gérer vos préférences de matching</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.grayDark} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/location')}>
            <View>
              <Text style={styles.menuTitle}>Ma localisation</Text>
              <Text style={styles.menuSubtitle}>Modifier votre position</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.grayDark} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/edit-profile')}>
            <View>
              <Text style={styles.menuTitle}>Editer profil</Text>
              <Text style={styles.menuSubtitle}>Modifier vos informations</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.grayDark} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/invite-friends')}>
            <View>
              <Text style={styles.menuTitle}>Invitez des amis</Text>
              <Text style={styles.menuSubtitle}>Partagez l'application</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.grayDark} />
          </TouchableOpacity>
        </View>

        {/* Private Mode */}
        <View style={styles.section}>
          <View style={styles.menuItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Mode privé</Text>
              <Text style={styles.menuSubtitle}>Masquer votre profil aux autres utilisateurs</Text>
            </View>
            <Switch
              value={privateMode}
              onValueChange={async (value) => {
                setPrivateMode(value);
                if (user) {
                  try {
                    await authService.updateUser(user.id, { privateMode: value });
                    await refreshUser();
                  } catch {
                    setPrivateMode(!value); // rollback on error
                  }
                }
              }}
              trackColor={{ false: Colors.grayLight, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/about')}>
            <View>
              <Text style={styles.menuTitle}>A propos</Text>
              <Text style={styles.menuSubtitle}>Informations sur l'application</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.grayDark} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>DECONNEXION</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight,
  },
  profileExpanded: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  profileCollapsed: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  profileImageContainerSmall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
    flexShrink: 0,
  },
  profileNameSmall: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.grayDark,
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
    color: Colors.grayDark,
    marginBottom: 5,
  },
  profileAge: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
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
    color: Colors.grayDark,
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
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
});
