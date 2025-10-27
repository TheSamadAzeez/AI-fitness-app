import { formatDuration } from '@/lib/utils';
import { client } from '@/src/lib/sanity/client';
import type { GetWorkoutQueryResult } from '@/src/lib/sanity/types';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getWorkoutQuery = defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc){
  _id,
  date,
  duration,
  exercises[] {
    exercise-> {
      _id,
      name,
    },
    sets[] {
      reps,
      weight,
      weightUnit,
      _type,
      _key
    },
    _type,
    _key
  }
}`);

export default function HistoryPage() {
  const { user } = useUser();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { refresh } = useLocalSearchParams();

  const fetchWorkouts = useCallback(async () => {
    if (!user) return;

    try {
      const result = await client.fetch(getWorkoutQuery, { userId: user.id });
      setWorkouts(result);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch workouts when the component mounts or when the user id changes
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  //  handle refresh via URL param
  useEffect(() => {
    if (refresh === 'true') {
      fetchWorkouts();
      // clear the refresh param from the URL
      router.replace('/(app)/(tabs)/history');
    }
  }, [refresh, fetchWorkouts, router]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return 'Duration not recorded';

    return formatDuration(seconds);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="border-b border-gray-200 bg-white px-6 py-4">
          <Text className="text-2xl font-bold text-gray-900">Workout History</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3882F6" />
          <Text className="mt-4 text-gray-600">Loading your workouts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900">Workout History</Text>
        <Text className="mt-1 text-gray-600">
          {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
        </Text>
      </View>

      {/* Workout List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {workouts.length === 0 ? (
          <View className="items-center rounded-2xl bg-white p-8">
            <Ionicons name="barbell-outline" size={64} color={'#9CA3AF'} />
            <Text className="mt-4 text-xl font-semibold text-gray-900">No workouts yet</Text>
            <Text className="mt-2 text-center text-gray-600">
              Your completed workouts will appear here
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
