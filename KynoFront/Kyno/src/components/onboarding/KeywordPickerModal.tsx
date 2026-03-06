import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import Colors from '@/src/constants/colors';
import type { Keyword } from '@/src/services/keywordService';

interface KeywordPickerModalProps {
  visible: boolean;
  title: string;
  keywords: Keyword[];
  selectedKeywords: string[];
  loadingKeywords: boolean;
  onToggle: (name: string) => void;
  onClose: () => void;
}

export function KeywordPickerModal({
  visible,
  title,
  keywords,
  selectedKeywords,
  loadingKeywords,
  onToggle,
  onClose,
}: KeywordPickerModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                }),
              }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {keywords && keywords.length > 0 ? (
              keywords.map((keyword) => (
                <TouchableOpacity
                  key={keyword.id}
                  style={[
                    styles.modalOption,
                    selectedKeywords.includes(keyword.name) && styles.modalOptionSelected,
                  ]}
                  onPress={() => onToggle(keyword.name)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedKeywords.includes(keyword.name) && styles.modalOptionTextSelected,
                  ]}>
                    {keyword.name}
                  </Text>
                  {selectedKeywords.includes(keyword.name) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.placeholderText}>
                {loadingKeywords ? 'Chargement des mots-clés...' : 'Aucun mot-clé disponible.'}
              </Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Fermer</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
    height: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionSelected: {
    backgroundColor: Colors.backgroundLight,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
  },
  modalOptionTextSelected: {
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
  },
  modalCloseButton: {
    paddingVertical: 12,
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.gray,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
