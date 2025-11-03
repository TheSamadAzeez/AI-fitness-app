import { client } from '@/src/lib/sanity/client';
import { GetWorkoutQueryResult } from '@/src/lib/sanity/types';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWorkoutQuery } from '../history/index';
import { formatDuration } from '@/lib/utils';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await client.fetch<GetWorkoutQueryResult>(getWorkoutQuery, {
        userId: user.id,
      });
      setWorkouts(result || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id, fetchWorkouts]);

  // calculate stats
  const totalWorkouts = workouts?.length || 0;
  const totalDuration = workouts?.reduce((sum, workout) => sum + (workout.duration || 0), 0) || 0; // in seconds
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // calculate days since joining
  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceJoining = Math.floor(
    (new Date().getTime() - joinDate.getTime()) / (1000 * 3600 * 24)
  );

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSignout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="px-6 pb-6 pt-8">
          <Text className="text-3xl font-bold text-gray-900">Profile</Text>
          <Text className="mt-1 text-lg text-gray-600">Manage your account and stats</Text>
        </View>

        {/* user info */}
        <View className="mb-6 px-6">
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <View className="mb-4 flex-row items-center">
              <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                <Image
                  source={{ uri: user?.imageUrl ?? user?.externalAccounts[0]?.imageUrl }}
                  className="h-16 w-16 rounded-full"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || 'User'}
                </Text>
                <Text className="text-gray-600">{user?.emailAddresses?.[0]?.emailAddress}</Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Member since {formatJoinDate(joinDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* stats overview */}
        <View className="mb-6 px-6">
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Your Fitness Stats</Text>
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-blue-600">{totalWorkouts}</Text>
                <Text className="text-center text-sm text-gray-600">Total{'\n'}Workouts</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {formatDuration(totalDuration)}
                </Text>
                <Text className="text-center text-sm text-gray-600">Total{'\n'}Time</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-purple-600">{daysSinceJoining}</Text>
                <Text className="text-center text-sm text-gray-600">Days{'\n'}Since Joining</Text>
              </View>
            </View>
            {totalWorkouts > 0 && (
              <View className="mt-4 border-t border-gray-100 pt-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Average Workout Duration</Text>
                  <Text className="font-semibold text-gray-900">
                    {formatDuration(averageDuration)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* account settings */}
        <View className="mb-6 px-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Account Settings</Text>

          {/* settings options */}
          <View className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <TouchableOpacity
              className="flex-row items-center justify-between border-b border-gray-100 p-4"
              activeOpacity={0.6}>
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="person-outline" size={20} color="#3B82F6" />
                </View>
                <Text className="font-medium text-gray-900">Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between border-b border-gray-100 p-4"
              activeOpacity={0.6}>
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Ionicons name="notifications-outline" size={20} color="#10B981" />
                </View>
                <Text className="font-medium text-gray-900">Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between border-b border-gray-100 p-4"
              activeOpacity={0.6}>
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Ionicons name="settings-outline" size={20} color="#8B5CF6" />
                </View>
                <Text className="font-medium text-gray-900">Preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between border-b border-gray-100 p-4"
              activeOpacity={0.6}>
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Ionicons name="help-circle-outline" size={20} color="#F59E0B" />
                </View>
                <Text className="font-medium text-gray-900">Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

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
      </ScrollView>
    </SafeAreaView>
  );
}
