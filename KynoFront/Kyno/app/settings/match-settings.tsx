import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import SettingsLayout from '@/src/components/SettingsLayout';
import Colors from '@/src/constants/colors';
import raceService from '@/src/services/raceService';
import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';
import type { Race } from '@/src/types';
import { SimpleSlider } from '@/src/components/ui/SimpleSlider';
import { RangeSlider } from '@/src/components/ui/RangeSlider';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { RaceDropdown } from '@/src/components/ui/RaceDropdown';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchFilters {
  gender: string | null;
  distanceKm: number;
  ageMin: number;
  ageMax: number;
  dogGender: string | null;
  dogSize: string | null;
  raceId: number | null;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const GENDERS = ['Homme', 'Femme', 'Indifférent'];
const DOG_GENDERS = ['Mâle', 'Femelle', 'Indifférent'];
const DOG_SIZES = ['Petit', 'Moyen', 'Grand', 'Très grand'];
const DISTANCE_MIN = 5;
const DISTANCE_MAX = 100;
const AGE_MIN = 18;
const AGE_MAX = 80;

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function MatchSettingsScreen() {
  const { user, refreshUser } = useAuth();
  const { authService } = useServices();
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<MatchFilters>({
    gender: null,
    distanceKm: 50,
    ageMin: 18,
    ageMax: 80,
    dogGender: null,
    dogSize: null,
    raceId: null,
  });
  const [races, setRaces] = useState<Race[]>([]);
  // Keep a ref so the useFocusEffect cleanup always has the latest filters
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  // Auto-save when leaving the screen (back gesture, hardware back, etc.)
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (!user) return;
        authService.updateUser(user.id, {
          filterGender: filtersRef.current.gender,
          filterDistanceKm: filtersRef.current.distanceKm,
          filterAgeMin: filtersRef.current.ageMin,
          filterAgeMax: filtersRef.current.ageMax,
          filterDogGender: filtersRef.current.dogGender,
          filterDogSize: filtersRef.current.dogSize,
          filterRace: filtersRef.current.raceId ? `/api/races/${filtersRef.current.raceId}` : null,
        }).then(() => refreshUser()).catch(() => {});
      };
    }, [user, authService, refreshUser]),
  );

  useEffect(() => {
    raceService.getRaces().then(setRaces).catch(() => setRaces([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    setFilters({
      gender: user.filterGender ?? null,
      distanceKm: user.filterDistanceKm ?? 50,
      ageMin: user.filterAgeMin ?? 18,
      ageMax: user.filterAgeMax ?? 80,
      dogGender: user.filterDogGender ?? null,
      dogSize: user.filterDogSize ?? null,
      raceId: user.filterRace?.id ?? null,
    });
  }, [user]);

  const set = useCallback(<K extends keyof MatchFilters>(key: K, val: MatchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleApply = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Explicit save via button — useFocusEffect cleanup will also fire but that's harmless
      await authService.updateUser(user.id, {
        filterGender: filters.gender,
        filterDistanceKm: filters.distanceKm,
        filterAgeMin: filters.ageMin,
        filterAgeMax: filters.ageMax,
        filterDogGender: filters.dogGender,
        filterDogSize: filters.dogSize,
        filterRace: filters.raceId ? `/api/races/${filters.raceId}` : null,
      });
      await refreshUser();
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout title="Paramètres de match">
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>

        {/* Genre */}
        <Text style={styles.label}>Genre</Text>
        <Dropdown
          placeholder="Sélectionnez un genre"
          value={filters.gender}
          options={GENDERS}
          onSelect={(v) => set('gender', v)}
        />

        {/* Distance */}
        <View style={styles.row}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.valueLabel}>{filters.distanceKm}KM</Text>
        </View>
        <SimpleSlider
          value={filters.distanceKm}
          min={DISTANCE_MIN}
          max={DISTANCE_MAX}
          step={5}
          onChange={(v) => set('distanceKm', v)}
        />

        {/* Age */}
        <View style={styles.row}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.valueLabel}>{filters.ageMin} - {filters.ageMax}</Text>
        </View>
        <RangeSlider
          min={AGE_MIN}
          max={AGE_MAX}
          valueMin={filters.ageMin}
          valueMax={filters.ageMax}
          onChangeMin={(v) => set('ageMin', v)}
          onChangeMax={(v) => set('ageMax', v)}
          step={2}
        />

        {/* Genre du chien */}
        <Text style={styles.label}>Genre du chien</Text>
        <Dropdown
          placeholder="Sélectionnez un genre"
          value={filters.dogGender}
          options={DOG_GENDERS}
          onSelect={(v) => set('dogGender', v)}
        />

        {/* Gabarit */}
        <Text style={styles.label}>Gabarit</Text>
        <Dropdown
          placeholder="Sélectionnez un gabarit"
          value={filters.dogSize}
          options={DOG_SIZES}
          onSelect={(v) => set('dogSize', v)}
        />

        {/* Race */}
        <Text style={styles.label}>Race</Text>
        <RaceDropdown
          races={races}
          selectedId={filters.raceId}
          onSelect={(v) => set('raceId', v)}
        />

        {/* Bouton */}
        <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85} disabled={saving}>
          {saving
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.applyButtonText}>WOOF !</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SettingsLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  valueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  applyButton: {
    marginTop: 32,
    backgroundColor: Colors.primaryLight,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.grayDark,
    letterSpacing: 1,
  },
});
