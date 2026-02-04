import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="pet-detail" />
      <Stack.Screen name="pet-images" />
      <Stack.Screen name="your-detail" />
      <Stack.Screen name="your-images" />
      <Stack.Screen name="location" />
    </Stack>
  );
}
