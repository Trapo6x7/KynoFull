import { useRef, useMemo, useEffect } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';
import { useServices } from '@/src/context/ServicesContext';
import type { MatchViewModel } from './useMatches';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UseSwipeOptions {
  matches: MatchViewModel[];
  currentIndex: number;
  currentUserId?: number;
  onNext?: () => void;
  onMatch: (match: MatchViewModel) => void;
  /** Appelé quand un swipe est enregistré — id du profil swipé. Remplace onNext quand fourni. */
  onSwiped?: (id: number) => void;
  /** Appelé quand l'utilisateur tape sur la carte (mouvement < 5px) */
  onTap?: () => void;
}

export const useSwipe = ({
  matches,
  currentIndex,
  currentUserId,
  onNext,
  onMatch,
  onSwiped,
  onTap,
}: UseSwipeOptions) => {
  const { matchService } = useServices();

  // Ref toujours fraîche pour onTap — évite le stale closure dans useMemo
  const onTapRef = useRef(onTap);
  useEffect(() => { onTapRef.current = onTap; }, [onTap]);

  // ─── Valeurs animées ────────────────────────────────────────────────────────
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const matchScale = useRef(new Animated.Value(0)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;
  const radarRotation = useRef(new Animated.Value(0)).current;

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    rotate.setValue(0);
  };

  // ─── Swipe gauche (dislike) ──────────────────────────────────────────────────
  const swipeLeft = () => {
    const targetUserId = matches[currentIndex]?.id;
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, { toValue: -20, duration: 300, useNativeDriver: false }),
    ]).start(() => {
      if (onSwiped && targetUserId) { onSwiped(targetUserId); } else { onNext?.(); }
      if (targetUserId) {
        matchService
          .recordDislike(targetUserId, currentUserId)
          .catch((e) => console.error('❌ Erreur dislike:', e));
      }
    });
  };

  // ─── Swipe droit (like) ──────────────────────────────────────────────────────
  const swipeRight = () => {
    const targetUserId = matches[currentIndex]?.id;
    const matchedCandidate = matches[currentIndex];
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: SCREEN_WIDTH + 100, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, { toValue: 20, duration: 300, useNativeDriver: false }),
    ]).start(() => {
      if (onSwiped && targetUserId) { onSwiped(targetUserId); } else { onNext?.(); }
      if (targetUserId) {
        matchService
          .recordLike(targetUserId, currentUserId)
          .then(({ isMatch }) => {
            if (isMatch) {
              onMatch(matchedCandidate);
              Animated.parallel([
                Animated.spring(matchScale, {
                  toValue: 1,
                  useNativeDriver: true,
                  friction: 8,
                }),
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(heartPulse, { toValue: 1.3, duration: 400, useNativeDriver: true }),
                    Animated.timing(heartPulse, { toValue: 1, duration: 400, useNativeDriver: true }),
                  ]),
                ),
              ]).start();
            }
          })
          .catch((e) => console.error('❌ Erreur like:', e));
      }
    });
  };

  // ─── PanResponder ────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
          rotate.setValue(gesture.dx / 10);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 120) {
            swipeRight();
          } else if (gesture.dx < -120) {
            swipeLeft();
          } else if (Math.abs(gesture.dx) < 15 && Math.abs(gesture.dy) < 15) {
            // Tap simple — pas de swipe
            onTapRef.current?.();
            Animated.parallel([
              Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
              Animated.spring(rotate, { toValue: 0, useNativeDriver: false }),
            ]).start();
          } else {
            Animated.parallel([
              Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
              Animated.spring(rotate, { toValue: 0, useNativeDriver: false }),
            ]).start();
          }
        },
      }),
    // Rebuild lorsque la carte change
    [matches, currentIndex],
  );

  return {
    pan,
    rotate,
    matchScale,
    heartPulse,
    radarRotation,
    panResponder,
    swipeLeft,
    swipeRight,
    resetCard,
  };
};
