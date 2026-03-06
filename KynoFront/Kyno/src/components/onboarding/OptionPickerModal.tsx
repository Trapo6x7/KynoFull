import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Colors from '@/src/constants/colors';

const { width } = Dimensions.get('window');

export interface PickerOption {
  label: string;
  value: string;
}

interface OptionPickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  scrollable?: boolean;
}

export function OptionPickerModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  scrollable = false,
}: OptionPickerModalProps) {
  const content = options.map((option) => (
    <TouchableOpacity
      key={option.value}
      style={[styles.modalOption, selectedValue === option.value && styles.modalOptionSelected]}
      onPress={() => {
        onSelect(option.value);
        onClose();
      }}
    >
      <Text style={[styles.modalOptionText, selectedValue === option.value && styles.modalOptionTextSelected]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  ));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalContent, scrollable && { maxHeight: '70%' }]}>
          <Text style={styles.modalTitle}>{title}</Text>
          {scrollable ? (
            <ScrollView showsVerticalScrollIndicator={false}>{content}</ScrollView>
          ) : (
            content
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    width: width * 0.8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: Colors.buttonPrimary,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: Colors.grayDark,
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    fontFamily: 'Manrope_600SemiBold',
  },
});
