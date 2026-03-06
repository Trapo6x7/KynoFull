import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function useImageUpload(onUpload: (uri: string) => Promise<void>) {
  const [uploading, setUploading] = useState(false);

  const handleAddImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire pour ajouter une photo.");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    });
    
    if (result.canceled || !result.assets[0]) return;
    
    setUploading(true);
    try {
      await onUpload(result.assets[0].uri);
    } catch {
      Alert.alert('Erreur', "Impossible d'uploader la photo. Réessaie.");
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  return { uploading, handleAddImage };
}
