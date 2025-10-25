import { Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, View } from 'react-native';

export default function Layout() {
  const { isSignedIn, isLoaded, userId, sessionId, getToken } = useAuth();

  console.log('Auth State:', {
    isSignedIn: isSignedIn as boolean,
    isLoaded: isLoaded,
    userId: userId,
    sessionId: sessionId,
  });

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={'#0000ff'} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={isSignedIn as boolean}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="exercise-detail"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            animationTypeForReplace: 'push',
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
