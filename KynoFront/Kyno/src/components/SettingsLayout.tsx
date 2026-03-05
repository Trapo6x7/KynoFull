import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';

interface Props {
  title: string;
  /** Élément optionnel côté droit (ex: bouton Enregistrer) */
  rightAction?: ReactNode;
  children: ReactNode;
}

export default function SettingsLayout({ title, rightAction, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        {rightAction ? (
          <View style={styles.rightSlot}>{rightAction}</View>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
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
  rightSlot: {
    alignItems: 'flex-end',
  },
});
