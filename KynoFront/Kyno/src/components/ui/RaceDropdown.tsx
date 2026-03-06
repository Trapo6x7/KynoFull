import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import type { Race } from '@/src/types';

interface RaceDropdownProps {
  races: Race[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function RaceDropdown({ races, selectedId, onSelect }: RaceDropdownProps) {
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

const styles = StyleSheet.create({
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.background,
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
});
