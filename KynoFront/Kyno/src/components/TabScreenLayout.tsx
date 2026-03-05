import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';

const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

interface Props {
  title: string;
  /** Slot gauche — par défaut : chevron-back vers router.back() */
  leftAction?: ReactNode;
  /** Slot droit — par défaut : spacer invisible */
  rightAction?: ReactNode;
  children: ReactNode;
}

export default function TabScreenLayout({ title, leftAction, rightAction, children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.header}>
        {leftAction !== undefined ? (
          leftAction
        ) : (
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={Colors.grayDark} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        {rightAction !== undefined ? rightAction : <View style={styles.headerBtn} />}
      </View>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: STATUS_H,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    fontSize: 18,
    paddingStart: 15,
    fontWeight: '700',
    color: Colors.grayDark,
  },
});
