import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import '../global.css';
import { StatusBar } from 'react-native';

export default function Layout() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ClerkProvider tokenCache={tokenCache}>
        <Slot />
      </ClerkProvider>
    </>
  );
}
