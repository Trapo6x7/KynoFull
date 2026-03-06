import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsLayout from '@/src/components/SettingsLayout';
import Constants from 'expo-constants';
import Colors from '@/src/constants/colors';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const LINKS = [
  {
    icon: 'document-text-outline' as const,
    label: "Conditions d'utilisation",
    url: 'https://kyno.app/terms',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    label: 'Politique de confidentialité',
    url: 'https://kyno.app/privacy',
  },
  {
    icon: 'mail-outline' as const,
    label: 'Nous contacter',
    url: 'mailto:support@kyno.app',
  },
];

export default function AboutScreen() {
  const handleLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SettingsLayout title="À propos">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo / branding */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('@/assets/images/kynoillustration.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/images/kynologo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTagline}>Trouvez des compagnons de promenade</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            Kyno est l'application qui met en relation les propriétaires de chiens pour partager
            des moments de promenade inoubliables. Trouvez des partenaires de balade proches de
            chez vous, créez des groupes et faites de nouvelles rencontres — pour vous et votre
            compagnon à quatre pattes.
          </Text>
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => router.push('/settings/faq')}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={22} color={Colors.primary} style={{ marginRight: 14 }} />
            <Text style={styles.linkLabel}>FAQ</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.grayLight} />
          </TouchableOpacity>
          <View style={styles.divider} />
          {LINKS.map((link, idx) => (
            <React.Fragment key={link.label}>
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => handleLink(link.url)}
                activeOpacity={0.7}
              >
                <Ionicons name={link.icon} size={22} color={Colors.primary} style={{ marginRight: 14 }} />
                <Text style={styles.linkLabel}>{link.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.grayLight} />
              </TouchableOpacity>
              {idx < LINKS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2026 Kyno. Tous droits réservés.</Text>
      </ScrollView>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  illustrationImage: {
    width: 180,
    height: 160,
    marginBottom: 8,
  },
  logoImage: {
    width: 110,
    height: 40,
    marginBottom: 6,
  },
  appTagline: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 4,
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  versionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 18,
    marginBottom: 28,
    width: '100%',
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 8,
    width: '100%',
    marginBottom: 32,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  linkLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginHorizontal: 12,
  },
  footer: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
});
