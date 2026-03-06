import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
  Image,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsLayout from '@/src/components/SettingsLayout';
import Colors from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';

const INVITE_MESSAGE =
  `Rejoins-moi sur Kyno 🐾 — l'app pour trouver des compagnons de promenade pour ton chien !

Télécharge l'app et retrouve-moi là-bas 🐕`;

export default function InviteFriendsScreen() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const togglePreview = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPreviewOpen((v) => !v);
  };

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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Illustration */}
        <View style={styles.illustration}>
          <Image
            source={require('@/assets/images/kynoillustration.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>
        <Image
          source={require('@/assets/images/kynologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Invitez vos amis</Text>
        <Text style={styles.subtitle}>
          Invitez vos amis à rejoindre la communauté et trouvez encore plus de compagnons de promenade !
        </Text>

        {/* Accordion : aperçu du message */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={togglePreview}
          activeOpacity={0.8}
        >
          <Text style={styles.accordionLabel}>Message d'invitation</Text>
          <Ionicons
            name={previewOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.grayDark}
          />
        </TouchableOpacity>
        {previewOpen && (
          <View style={styles.previewCard}>
            <Text style={styles.previewText}>{INVITE_MESSAGE}</Text>
          </View>
        )}

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
                color={opt.primary ? Colors.grayDark : Colors.grayDark}
                style={{ marginRight: 10 }}l
              />
              <Text style={[styles.actionText, opt.primary && styles.actionTextPrimary]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  illustration: {
    width: 180,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 100,
    height: 36,
    marginBottom: 20,
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
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 16,
    marginBottom: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryLight,
  },
  accordionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.grayDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 16,
    width: '100%',
    marginBottom: 28,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryLight,
  },
  previewText: {
    fontSize: 13,
    color: Colors.grayDark,
    lineHeight: 19,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    paddingTop: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: Colors.grayDark,
    backgroundColor: Colors.white,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.grayDark,
  },
  actionTextPrimary: {
    color: Colors.grayDark,
  },
});
