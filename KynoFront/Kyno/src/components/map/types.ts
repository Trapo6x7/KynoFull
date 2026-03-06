import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';

export type SpotCategory = 'Tous' | 'Parcs' | 'Forêts' | "Bords d'eau" | 'Aires dogs';

export const CATEGORY_META: Record<
  Exclude<SpotCategory, 'Tous'>,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  Parcs: { icon: 'leaf-outline', color: '#66BB6A' },
  Forêts: { icon: 'trail-sign-outline', color: '#8D6E63' },
  "Bords d'eau": { icon: 'water-outline', color: '#42A5F5' },
  'Aires dogs': { icon: 'paw-outline', color: Colors.buttonText },
};

export const FILTERS: SpotCategory[] = ['Tous', 'Parcs', 'Forêts', "Bords d'eau", 'Aires dogs'];
