import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  LayoutChangeEvent,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import raceService from '@/src/services/raceService';
import type { Race } from '@/src/types';

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

const THUMB = 22;

// ─── Slider simple ────────────────────────────────────────────────────────────

function snap(val: number, step: number) {
  return Math.round(val / step) * step;
}

function SimpleSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const startRatio = useRef(0);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const ratio = width > 0 ? (value - min) / (max - min) : 0;
  const thumbLeft = ratio * width - THUMB / 2;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (widthRef.current > 0) {
          const r = Math.min(Math.max(evt.nativeEvent.locationX / widthRef.current, 0), 1);
          startRatio.current = r;
          onChange(snap(min + r * (max - min), step));
        }
      },
      onPanResponderMove: (_, gs) => {
        if (widthRef.current === 0) return;
        const r = Math.min(Math.max(startRatio.current + gs.dx / widthRef.current, 0), 1);
        onChange(snap(min + r * (max - min), step));
      },
    })
  ).current;

  return (
    <View
      style={styles.sliderContainer}
      onLayout={(e: LayoutChangeEvent) => {
        widthRef.current = e.nativeEvent.layout.width;
        setWidth(e.nativeEvent.layout.width);
      }}
      {...pan.panHandlers}
    >
      <View style={styles.sliderTrackBg} />
      {width > 0 && (
        <>
          <View style={[styles.sliderFillAbs, { width: ratio * width }]} />
          <View style={[styles.sliderThumbAbs, { left: thumbLeft }]} />
        </>
      )}
    </View>
  );
}

// ─── Range Slider (2 poignées) ────────────────────────────────────────────────

function RangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  step,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
  step?: number;
}) {
  const stepVal = step ?? 1;
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const valueMinRef = useRef(valueMin);
  const valueMaxRef = useRef(valueMax);
  const startRatioMin = useRef(0);
  const startRatioMax = useRef(0);

  useEffect(() => { valueMinRef.current = valueMin; }, [valueMin]);
  useEffect(() => { valueMaxRef.current = valueMax; }, [valueMax]);

  const ratioMin = width > 0 ? (valueMin - min) / (max - min) : 0;
  const ratioMax = width > 0 ? (valueMax - min) / (max - min) : 1;
  const thumbMinLeft = ratioMin * width - THUMB / 2;
  const thumbMaxLeft = ratioMax * width - THUMB / 2;

  const panMin = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRatioMin.current = (valueMinRef.current - min) / (max - min);
      },
      onPanResponderMove: (_, gs) => {
        if (widthRef.current === 0) return;
        const r = Math.min(Math.max(startRatioMin.current + gs.dx / widthRef.current, 0), 1);
        const newVal = snap(min + r * (max - min), stepVal);
        if (newVal < valueMaxRef.current) onChangeMin(newVal);
      },
    })
  ).current;

  const panMax = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRatioMax.current = (valueMaxRef.current - min) / (max - min);
      },
      onPanResponderMove: (_, gs) => {
        if (widthRef.current === 0) return;
        const r = Math.min(Math.max(startRatioMax.current + gs.dx / widthRef.current, 0), 1);
        const newVal = snap(min + r * (max - min), stepVal);
        if (newVal > valueMinRef.current) onChangeMax(newVal);
      },
    })
  ).current;

  return (
    <View
      style={styles.sliderContainer}
      onLayout={(e: LayoutChangeEvent) => {
        widthRef.current = e.nativeEvent.layout.width;
        setWidth(e.nativeEvent.layout.width);
      }}
    >
      <View style={styles.sliderTrackBg} />
      {width > 0 && (
        <>
          <View style={[styles.sliderFillAbs, {
            left: ratioMin * width,
            width: (ratioMax - ratioMin) * width,
          }]} />
          <View style={[styles.sliderThumbAbs, { left: thumbMinLeft }]} {...panMin.panHandlers} />
          <View style={[styles.sliderThumbAbs, { left: thumbMaxLeft }]} {...panMax.panHandlers} />
        </>
      )}
    </View>
  );
}

// ─── Dropdown générique ───────────────────────────────────────────────────────

function Dropdown({
  placeholder,
  value,
  options,
  onSelect,
}: {
  placeholder: string;
  value: string | null;
  options: string[];
  onSelect: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.primary} />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{placeholder}</Text>
            <FlatList
              data={['Indifférent', ...options.filter(o => o !== 'Indifférent')]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, value === item && styles.modalOptionSelected]}
                  onPress={() => {
                    onSelect(item === 'Indifférent' ? null : item);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, value === item && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Dropdown Race ─────────────────────────────────────────────────────────────

function RaceDropdown({
  races,
  selectedId,
  onSelect,
}: {
  races: Race[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedName = races.find(r => r.id === selectedId)?.name ?? null;

  return (
    <>
      <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.dropdownText, !selectedName && styles.dropdownPlaceholder]}>
          {selectedName ?? 'Sélectionnez une race'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.primary} />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Race</Text>
            <FlatList
              data={[{ id: 0, name: 'Indifférent' } as Race, ...races]}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, selectedId === item.id && styles.modalOptionSelected]}
                  onPress={() => {
                    onSelect(item.id === 0 ? null : item.id);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, selectedId === item.id && styles.modalOptionTextSelected]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function MatchSettingsScreen() {
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

  useEffect(() => {
    raceService.getRaces().then(setRaces).catch(() => setRaces([]));
  }, []);

  const set = useCallback(<K extends keyof MatchFilters>(key: K, val: MatchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleApply = () => {
    // TODO : persister les filtres (AsyncStorage ou contexte global)
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres de match</Text>
        <View style={styles.headerSpacer} />
      </View>

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
        <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85}>
          <Text style={styles.applyButtonText}>WOOF !</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.backgroundLight,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.grayDark,
  },
  headerSpacer: {
    width: 36,
  },
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
  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: Colors.white,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.grayDark,
  },
  dropdownPlaceholder: {
    color: Colors.gray,
  },
  // Slider
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
    marginVertical: 4,
  },
  sliderTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 13,
    height: 4,
    backgroundColor: Colors.grayLight,
    borderRadius: 2,
  },
  sliderFillAbs: {
    position: 'absolute',
    left: 0,
    top: 13,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  sliderThumbAbs: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    top: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.grayDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: Colors.backgroundLight,
  },
  modalOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modalOptionText: {
    fontSize: 15,
    color: Colors.grayDark,
  },
  modalOptionTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  // Bouton
  applyButton: {
    marginTop: 32,
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
});
