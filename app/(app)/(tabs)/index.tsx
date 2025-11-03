import { client } from '@/src/lib/sanity/client';
import { GetWorkoutQueryResult } from '@/src/lib/sanity/types';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWorkoutQuery } from './history/index';
import { formatDate, formatDuration } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<GetWorkoutQueryResult>([]);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id, fetchWorkouts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  // calculate stats
  const totalWorkouts = workouts?.length || 0;
  const lastWorkout = workouts?.[0];
  const totalDuration = workouts?.reduce((sum, workout) => sum + (workout.duration || 0), 0) || 0; // in seconds
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  const getTotalSets = (workout: GetWorkoutQueryResult[number]) => {
    return workout.exercises?.reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0) || 0;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading your stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* header */}
        <View className="px-6 pb-6 pt-8">
          <Text className="text-lg text-gray-600">Welcome back,</Text>
          <Text className="text-3xl font-bold text-gray-900">
            {user?.firstName || 'Athlete'}! 💪
          </Text>
        </View>
        {/* stats overview */}
        <View className="mb-6 px-6">
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Your Stats</Text>
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
                <Text className="text-2xl font-bold text-purple-600">
                  {averageDuration > 0 ? formatDuration(averageDuration) : '0m'}
                </Text>
                <Text className="text-center text-sm text-gray-600">Average{'\n'}Duration</Text>
              </View>
            </View>
          </View>
        </View>
        {/* quick actions */}
        <View className="mb-6 px-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</Text>

          {/* start workout button */}
          <TouchableOpacity
            className="mb-4 rounded-2xl bg-blue-600 p-6 shadow-sm"
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/(tabs)/workout')}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                  <Ionicons name="play" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-xl font-semibold text-white">Start Workout</Text>
                  <Text className="text-blue-100">Begin your training session</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* action grid */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <TouchableOpacity
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                activeOpacity={0.7}
                onPress={() => router.push('/(app)/(tabs)/history')}>
                <View className="flex-1 items-center justify-center">
                  <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Ionicons name="time-outline" size={24} color="#6B7280" />
                  </View>
                  <Text className="text-center font-medium text-gray-900">
                    Workout{'\n'}History
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <TouchableOpacity
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                activeOpacity={0.7}
                onPress={() => router.push('/(app)/(tabs)/exercises')}>
                <View className="flex-1 items-center justify-center">
                  <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Ionicons name="barbell-outline" size={24} color="#6B7280" />
                  </View>
                  <Text className="text-center font-medium text-gray-900">
                    Browse{'\n'}Exercises
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>{' '}
        {/* last workout card */}
        {lastWorkout && (
          <View className="mb-8 px-6">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Last Workout</Text>
            <TouchableOpacity
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(app)/(tabs)/history/workout-record',
                  params: { workoutId: lastWorkout._id },
                })
              }>
              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatDate(lastWorkout.date || '')}
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="ml-2 text-gray-600">
                      {lastWorkout.duration
                        ? formatDuration(lastWorkout.duration)
                        : 'Duration not recorded'}
                    </Text>
                  </View>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">
                  {lastWorkout.exercises?.length || 0} exercises : {getTotalSets(lastWorkout)} sets
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
