export type SpotCategory = 'Tous' | 'Parcs' | 'Forêts' | 'Bords d\'eau' | 'Aires dogs';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface WalkSpot {
  id: number;
  name: string;
  address: string;
  distance: string;
  category: Exclude<SpotCategory, 'Tous'>;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

export type MapState = 
  | { type: 'loading' }
  | { type: 'error'; retry: () => void }
  | { 
      type: 'ready'; 
      region: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      };
      userLocation: Coordinate;
      spots: WalkSpot[];
      filteredSpots: WalkSpot[];
      activeFilter: SpotCategory;
      setFilter: (filter: SpotCategory) => void;
    };
