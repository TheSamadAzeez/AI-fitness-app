import { formatDate, formatDuration } from '@/lib/utils';
import { client } from '@/src/lib/sanity/client';
import type { GetWorkoutQueryResult } from '@/src/lib/sanity/types';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const getWorkoutQuery =
  defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc){
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

  const getTotalSets = (workout: GetWorkoutQueryResult[number]) => {
    return (
      workout?.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets?.length || 0);
      }, 0) || 0
    );
  };

  const getExerciseNames = (workout: GetWorkoutQueryResult[number]) => {
    return workout.exercises?.map((exercise) => exercise.exercise?.name).filter(Boolean) || [];
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="border-b border-gray-200 bg-white px-6 py-4">
          <Text className="text-2xl font-bold text-gray-900">Workout History</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading your workouts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
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
        ) : (
          <View className="gap-4 space-y-4">
            {workouts.map((workout) => (
              <TouchableOpacity
                key={workout._id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: '/history/workout-record',
                    params: { workoutId: workout._id },
                  });
                }}>
                {/* Workout header */}
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {formatDate(workout.date as string)}
                    </Text>
                    <View className="mt-1 flex-row items-center">
                      <Ionicons name="time-outline" size={16} color={'#6B7280'} />
                      <Text className="ml-2 text-gray-600">
                        {formatWorkoutDuration(workout.duration as number)}
                      </Text>
                    </View>
                  </View>
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Ionicons name="fitness-outline" size={24} color={'#3B82F6'} />
                  </View>
                </View>

                {/* workout stats */}
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-3 rounded-lg bg-gray-100 px-3 py-2">
                      <Text className="text-sm font-medium text-gray-700">
                        {workout.exercises?.length || 0} exercise
                        {(workout.exercises?.length || 0) !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View className="rounded-lg bg-gray-100 px-3 py-2">
                      <Text className="text-sm font-medium text-gray-700">
                        {getTotalSets(workout)} set
                        {getTotalSets(workout) !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* exercise list */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <View>
                    <Text className="mb-2 text-sm font-medium text-gray-700">Exercises:</Text>
                    <View className="flex-row flex-wrap">
                      {getExerciseNames(workout)
                        .slice(0, 3)
                        .map((name, index) => (
                          <View key={index} className="mb-2 mr-2 rounded-lg bg-blue-50 px-3 py-1">
                            <Text className="text-sm font-medium text-blue-700">{name}</Text>
                          </View>
                        ))}
                      {getExerciseNames(workout).length > 3 && (
                        <View className="mb-2 mr-2 rounded-lg bg-gray-100 px-3 py-1">
                          <Text className="text-sm font-medium text-gray-600">
                            +{getExerciseNames(workout).length - 3} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
