import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import type { MatchViewModel } from '@/hooks/useMatches';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.55;

interface MatchCardProps {
  match: MatchViewModel;
  pan: Animated.ValueXY;
  rotate: Animated.Value;
  panResponder: ReturnType<typeof import('react-native').PanResponder.create>;
  showDogInfo: boolean;
  onToggleDogInfo: () => void;
  /** Ouvre le profil complet en mode preview */
  onViewProfile?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  pan,
  rotate,
  panResponder,
  showDogInfo,
  onToggleDogInfo,
  onViewProfile,
}) => {
  const rotateInterpolate = rotate.interpolate({
    inputRange: [-20, 0, 20],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  const activeImage = showDogInfo ? match.dogMainImage : match.mainImage;
  const activeImages = showDogInfo ? match.dogAdditionalImages : match.additionalImages;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        styles.cardTop,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate: rotateInterpolate },
          ],
        },
      ]}
    >
      {/* Header profil  */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: activeImage }} style={styles.profileImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>
            {showDogInfo ? match.dogName : match.name}
            {!showDogInfo && match.userAge ? `, ${match.userAge}` : ''}
            {showDogInfo && match.dogAge ? `, ${match.dogAge}` : ''}
          </Text>
          <Text style={styles.profileDistance}>
            {showDogInfo && match.dogBreed ? match.dogBreed : match.distance}
          </Text>
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={onToggleDogInfo}>
          <Ionicons
            name="paw-outline"
            size={20}
            color={showDogInfo ? Colors.primary : Colors.gray}
          />
        </TouchableOpacity>
      </View>

      {/* Image principale */}
      <Image source={{ uri: activeImage }} style={styles.cardMainImage} />

      {/* Overlay info */}
      <View style={styles.cardOverlay}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>
            {match.name} &{' '}
            <Text style={styles.cardTitleAccent}>{match.dogName}</Text>
          </Text>
          {onViewProfile && (
            <TouchableOpacity style={styles.viewProfileBtn} onPress={onViewProfile} activeOpacity={0.85}>
              <Ionicons name="person-outline" size={18} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.additionalImagesContainer}>
          {activeImages.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.additionalImage} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 30,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    position: 'absolute',
  },
  cardTop: {
    zIndex: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 5,
  },
  profileImage: {
    marginTop: 6,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.grayDark,
  },
  profileDistance: {
    fontSize: 14,
    color: Colors.gray,
  },
  toggleButton: {
    marginTop: 6,
    marginLeft: 6,
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: Colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMainImage: {
    width: '100%',
    height: CARD_HEIGHT,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    paddingBottom: 30,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
  },
  viewProfileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  cardTitleAccent: {
    color: Colors.primary,
  },
  additionalImagesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  additionalImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
