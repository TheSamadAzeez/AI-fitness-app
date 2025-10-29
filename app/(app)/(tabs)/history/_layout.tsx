import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="workout-record"
        options={{ headerShown: true, headerTitle: 'Workout Record', headerBackTitle: 'History' }}
      />
    </Stack>
  );
}
