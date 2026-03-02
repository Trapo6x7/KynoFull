import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.46;
const PREVIEW_EXTRA = 54; // extra height below hero so buttons can straddle the edge
const THUMB_SIZE = (width - 48) / 2;

export type ProfileMode = 'me' | 'match' | 'preview';

export interface ProfileDetailViewProps {
  mode: ProfileMode;
  /** 'owner' | 'pet' — détermine le libellé "Mon profil" / "Mon chien" */
  type?: 'owner' | 'pet';
  name: string;
  /** URL principale (image héro) */
  mainImage?: string;
  /** Toutes les images (incluant la principale) */
  images?: string[];
  keywords?: string[];
  description?: string;
  /** Bouton secondaire en bas-droite du héro (ex. patte pour switcher owner⟷pet) */
  onSubProfile?: () => void;
  subProfileIcon?: React.ComponentProps<typeof Ionicons>['name'];
  subProfileLabel?: string;
  onBack?: () => void;
  /** Mode preview : passer / liker / profil suivant */
  onLike?: () => void;
  onDislike?: () => void;
  onNext?: () => void;
  /** Mode me : édition */
  onEdit?: () => void;
  /** Mode me : ajout/remplacement de la photo principale */
  onAddImage?: () => void;
}

export const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({
  mode,
  type = 'owner',
  name,
  mainImage,
  images = [],
  keywords = [],
  description,
  onSubProfile,
  subProfileIcon = 'paw-outline',
  subProfileLabel,
  onBack,
  onLike,
  onDislike,
  onNext,
  onEdit,
  onAddImage,
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'apropos'>('images');

  // heroWrapper is taller in preview mode so buttons can sit à cheval on the photo edge
  const heroWrapperHeight = mode === 'preview' ? HERO_HEIGHT + PREVIEW_EXTRA : HERO_HEIGHT;

  const heroUri = mainImage || (images[0] ?? null);
  const galleryImages = images.length > 0 ? images : [];

  const headerLabel =
    mode === 'me'
      ? type === 'pet'
        ? 'Mon chien'
        : 'Mon profil'
      : name;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Wrapper héro + boutons ── */}
      <View style={[styles.heroWrapper, { height: heroWrapperHeight }]}>
        {/* Photo */}
        <View style={styles.heroContainer}>
          {heroUri ? (
            <Image source={{ uri: heroUri }} style={styles.heroImage} resizeMode="cover" />
          ) : mode === 'me' ? (
            /* Placeholder cliquable pour uploader une photo */
            <TouchableOpacity
              style={[styles.heroImage, styles.heroPlaceholder]}
              onPress={onAddImage}
              activeOpacity={0.8}
            >
              <View style={styles.addPhotoBtn}>
                <Ionicons name="camera-outline" size={36} color={Colors.white} />
                <Text style={styles.addPhotoText}>Ajouter une photo</Text>
              </View>
            </TouchableOpacity>
          ) : (
            /* Pas d'image en mode preview/match : fond sombre neutre */
            <View style={[styles.heroImage, styles.heroEmpty]} />
          )}
          {/* overlay seulement quand une image est chargée */}
          {heroUri && <View style={styles.heroOverlay} />}
        </View>

        {/* Top-left : retour + nom */}
        <View style={styles.heroTopLeft}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.heroName}>{headerLabel}</Text>
        </View>

        {/* Top-right : toggle paw/person */}
        {onSubProfile && (
          <TouchableOpacity style={styles.subProfileBtn} onPress={onSubProfile} activeOpacity={0.85}>
            <Ionicons
              name={subProfileIcon}
              size={22}
              color={type === 'pet' ? Colors.primary : Colors.gray}
            />
          </TouchableOpacity>
        )}

        {/* Crayon mode me */}
        {mode === 'me' && onEdit && (
          <View style={styles.matchActions}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionEdit]} onPress={onEdit} activeOpacity={0.85}>
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Boutons preview — dans la bande blanche sous l'image */}
        {mode === 'preview' && (
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewBtn} onPress={onDislike} activeOpacity={0.85}>
              <Ionicons name="close" size={32} color={Colors.gray} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.previewBtn, styles.previewLikeBtn]} onPress={onLike} activeOpacity={0.85}>
              <Ionicons name="heart" size={32} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewBtn} onPress={onNext} activeOpacity={0.85}>
              <Ionicons name="refresh" size={28} color={Colors.gray} />
            </TouchableOpacity>
          </View>
        )}
      </View>

  {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'images' && styles.tabActive]}
          onPress={() => setActiveTab('images')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'images' && styles.tabTextActive]}>
            IMAGES
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'apropos' && styles.tabActive]}
          onPress={() => setActiveTab('apropos')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'apropos' && styles.tabTextActive]}>
            À PROPOS
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Contenu ── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'images' ? (
          <ImageGrid images={galleryImages} mode={mode} onAddImage={onAddImage} />
        ) : (
          <AProposContent name={name} keywords={keywords} description={description} />
        )}
      </ScrollView>
    </View>
  );
};

/* ── Image grid ──────────────────────────────────────────────────────────────── */
function ImageGrid({
  images,
  mode,
  onAddImage,
}: {
  images: string[];
  mode: ProfileMode;
  onAddImage?: () => void;
}) {
  if (images.length === 0) {
    if (mode !== 'me') {
      return (
        <View style={styles.emptyImages}>
          <Ionicons name="images-outline" size={48} color={Colors.grayLight} />
          <Text style={styles.emptyText}>Aucune photo</Text>
        </View>
      );
    }
    return (
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <TouchableOpacity style={[styles.gridThumb, styles.gridAddThumb]} onPress={onAddImage} activeOpacity={0.8}>
            <Ionicons name="add" size={36} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const rows: string[][] = [];
  for (let i = 0; i < images.length; i += 2) {
    rows.push(images.slice(i, i + 2));
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.gridRow}>
          {row.map((uri, ci) => (
            <Image
              key={ci}
              source={{ uri }}
              style={styles.gridThumb}
              resizeMode="cover"
            />
          ))}
          {row.length === 1 && mode === 'me' && (
            <TouchableOpacity style={[styles.gridThumb, styles.gridAddThumb]} onPress={onAddImage} activeOpacity={0.8}>
              <Ionicons name="add" size={36} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {images.length % 2 === 0 && mode === 'me' && (
        <View style={styles.gridRow}>
          <TouchableOpacity style={[styles.gridThumb, styles.gridAddThumb]} onPress={onAddImage} activeOpacity={0.8}>
            <Ionicons name="add" size={36} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ── À propos content ────────────────────────────────────────────────────────── */
function AProposContent({
  name,
  keywords,
  description,
}: {
  name: string;
  keywords: string[];
  description?: string;
}) {
  return (
    <View style={styles.apropos}>
      <Text style={styles.aproposSection}>Nom</Text>
      <Text style={styles.aproposName}>{name}</Text>

      <Text style={[styles.aproposSection, { marginTop: 18 }]}>À propos</Text>
      <View style={styles.chips}>
        {keywords.length > 0 ? (
          keywords.map((kw, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{kw}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun mot-clé</Text>
        )}
      </View>

      <Text style={[styles.aproposSection, { marginTop: 18 }]}>Description</Text>
      <Text style={styles.aproposDesc}>
        {description || 'Aucune description renseignée.'}
      </Text>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  /* Wrapper héro + boutons preview */
  heroWrapper: {
    width,
    position: 'relative', // contexte de positionnement pour les enfants absolute
    backgroundColor: Colors.white,
    // height is set via inline style (heroWrapperHeight) to vary by mode
  },

  /* Héro (photo uniquement) */
  heroContainer: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: Colors.grayLight,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmpty: {
    backgroundColor: '#1a1a1a',
  },
  addPhotoBtn: {
    alignItems: 'center',
    gap: 10,
  },
  addPhotoText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.9,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },  heroTopLeft: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 52,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroName: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* Bouton crayon mode me */
  matchActions: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  actionEdit: {
    backgroundColor: Colors.primary,
  },

  /* Actions preview — à cheval entre le bas de la photo et la bande blanche */
  previewActions: {
    position: 'absolute',
    top: HERO_HEIGHT - 40, // centre des boutons aligné sur le bas de la photo
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBtn: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: Colors.grayLight,
    color: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  previewLikeBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.buttonPrimary,
  },

  /* Bouton toggle sous-profil (haut-droite) */
  subProfileBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 52,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  subProfileLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    backgroundColor: Colors.white,
  },
  tabBarPreview: {
    marginTop: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: Colors.primary,
  },

  /* Contenu */
  content: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 40,
  },

  /* Grille images */
  grid: {
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
  },
  gridAddThumb: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.buttonPrimary,
  },
  emptyImages: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
  },

  /* À propos */
  apropos: {
    paddingBottom: 10,
  },
  aproposSection: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  aproposName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.grayDark,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '500',
  },
  aproposDesc: {
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 22,
  },
});

export default ProfileDetailView;
