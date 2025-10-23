import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfilePage() {
  const { signOut } = useAuth();

  const handleSignout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };
  return (
    <SafeAreaView className="flex flex-1">
      <Text>Profile</Text>

      {/* Sign out button */}
      <View className="mb-8 px-6">
        <TouchableOpacity
          onPress={handleSignout}
          className="rounded-2xl bg-red-600 p-4 shadow-sm"
          activeOpacity={0.8}>
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="ml-2 text-lg font-semibold text-white">Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
