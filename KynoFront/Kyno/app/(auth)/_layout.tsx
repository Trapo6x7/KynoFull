import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ 
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
        }} 
      />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
