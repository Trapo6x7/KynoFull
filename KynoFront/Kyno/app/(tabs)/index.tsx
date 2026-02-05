import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  // Écran vide ou message neutre
  return (
    <View style={styles.container}>
      {/* Rien ou un message minimal */}
      {/* <Text style={styles.text}>Bienvenue sur Kyno !</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    color: '#333',
  },
});
