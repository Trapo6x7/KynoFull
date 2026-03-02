import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';

interface SwipeActionsProps {
  onPass: () => void;
  onLike: () => void;
  onRefresh: () => void;
}

/**
 * Barre d'actions swipe : Passer / Liker / Rafraîchir.
 * Responsabilité unique : rendu des boutons d'action. (SRP)
 */
export const SwipeActions: React.FC<SwipeActionsProps> = ({ onPass, onLike, onRefresh }) => (
  <View style={styles.actionsContainer}>
    <TouchableOpacity style={styles.actionButton} onPress={onPass}>
      <Ionicons name="close" size={32} color={Colors.gray} />
    </TouchableOpacity>
    <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={onLike}>
      <Ionicons name="heart" size={32} color={Colors.primary} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
      <Ionicons name="refresh" size={28} color={Colors.gray} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: Colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: Colors.buttonPrimary,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
