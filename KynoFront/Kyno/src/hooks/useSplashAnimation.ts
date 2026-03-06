/**
 * useSplashAnimation — SRP
 * Isole toute la logique d'animation de SplashScreen.
 * Retourne les styles animés et l'état `showWelcome`.
 */
import { useState, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const PHASE1_DURATION = 1500;
const ZOOM_DURATION   = 800;
const PHASE2_DURATION = 1000;
const SLIDE_DURATION  = 600;
const FADE_DURATION   = 400;


export function useSplashAnimation(onFinish?: () => void) {
  const [showWelcome, setShowWelcome] = useState(false);

  const zoomScale             = useSharedValue(1);
  const illustrationTranslateY = useSharedValue(0);
  const illustrationScale     = useSharedValue(1.4);
  const textLogoTranslateY    = useSharedValue(0);
  const textLogoScale         = useSharedValue(1.4);
  const contentOpacity        = useSharedValue(0);
  const buttonsTranslateY     = useSharedValue(50);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Phase 1 → zoom
    const timer1 = setTimeout(() => {
      zoomScale.value = withTiming(1.4, {
        duration: ZOOM_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    }, PHASE1_DURATION);

    // Phase 2 → welcome slide-in
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const timer2 = setTimeout(() => {
      setShowWelcome(true);

      illustrationScale.value = withTiming(1.2, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      illustrationTranslateY.value = withTiming(-height * 0.065, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      textLogoTranslateY.value = withTiming(-(width * 0.5 + 140), {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      textLogoScale.value = withTiming(0.85, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      contentOpacity.value = withDelay(
        SLIDE_DURATION * 0.4,
        withTiming(1, { duration: FADE_DURATION }),
      );
      buttonsTranslateY.value = withDelay(
        SLIDE_DURATION * 0.4,
        withTiming(0, {
          duration: FADE_DURATION,
          easing: Easing.out(Easing.back(1.5)),
        }),
      );

      finishTimer = setTimeout(() => {
        try { onFinish?.(); } catch { /* ignore */ }
      }, SLIDE_DURATION + FADE_DURATION + 50);
    }, PHASE1_DURATION + ZOOM_DURATION + PHASE2_DURATION);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (finishTimer !== undefined) clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Styles animés ──────────────────────────────────────────────────────────
  const splashAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoomScale.value }],
  }));

  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: showWelcome ? illustrationScale.value : zoomScale.value },
      { translateY: showWelcome ? illustrationTranslateY.value : 0 },
    ],
  }));

  const textLogoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: showWelcome ? textLogoTranslateY.value : 0 },
      { scale: showWelcome ? textLogoScale.value : zoomScale.value },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  return {
    showWelcome,
    splashAnimatedStyle,
    illustrationAnimatedStyle,
    textLogoAnimatedStyle,
    contentAnimatedStyle,
  };
}
