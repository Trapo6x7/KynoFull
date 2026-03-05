import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsLayout from '@/src/components/SettingsLayout';
import Colors from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';

const APP_STORE_LINK = 'https://apps.apple.com/app/kyno';
const PLAY_STORE_LINK = 'https://play.google.com/store/apps/details?id=com.kyno';

const INVITE_MESSAGE = `Rejoins-moi sur Kyno 🐾 — l'app pour trouver des compagnons de promenade pour ton chien !\n\niOS : ${APP_STORE_LINK}\nAndroid : ${PLAY_STORE_LINK}`;

export default function InviteFriendsScreen() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: INVITE_MESSAGE,
        title: 'Kyno — Promenades entre chiens',
      });
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir le partage.");
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(INVITE_MESSAGE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const SHARE_OPTIONS = [
    {
      icon: 'share-social' as const,
      label: 'Partager via…',
      onPress: handleShare,
      primary: true,
    },
    {
      icon: 'copy' as const,
      label: copied ? 'Lien copié !' : 'Copier le lien',
      onPress: handleCopyLink,
      primary: false,
    },
  ];

  return (
    <SettingsLayout title="Invitez des amis">
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustration}>
          <Text style={styles.illustrationEmoji}>🐾</Text>
        </View>

        <Text style={styles.title}>Partagez Kyno</Text>
        <Text style={styles.subtitle}>
          Invitez vos amis à rejoindre la communauté et trouvez encore plus de compagnons de promenade !
        </Text>

        {/* Preview message */}
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Message d'invitation</Text>
          <Text style={styles.previewText}>{INVITE_MESSAGE}</Text>
        </View>

        {/* Share actions */}
        <View style={styles.actionsContainer}>
          {SHARE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.actionButton, opt.primary && styles.actionButtonPrimary]}
              onPress={opt.onPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={opt.icon}
                size={20}
                color={opt.primary ? Colors.white : Colors.primary}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.actionText, opt.primary && styles.actionTextPrimary]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  illustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  illustrationEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.grayDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 16,
    width: '100%',
    marginBottom: 28,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 13,
    color: Colors.grayDark,
    lineHeight: 19,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionTextPrimary: {
    color: Colors.white,
  },
});
