import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';

interface DropdownProps {
  placeholder: string;
  value: string | null;
  options: string[];
  onSelect: (v: string | null) => void;
}

export function Dropdown({ placeholder, value, options, onSelect }: DropdownProps) {
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
