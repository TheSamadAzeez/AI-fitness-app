import { formatDuration } from '@/lib/utils';
import { client } from '@/src/lib/sanity/client';
import { GetWorkoutRecordQueryResult } from '@/src/lib/sanity/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getWorkoutRecordQuery = defineQuery(`*[_type == "workout" && _id == $workoutId][0]{
    _id, _type,_createdAt, date, duration, exercises[] {
    exercise-> {
      _id,
      name,
      description,
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

export default function WorkoutRecord() {
  const { workoutId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [workout, setWorkout] = useState<GetWorkoutRecordQueryResult | null>(null);

  useEffect(() => {
    const fetchWorkoutRecord = async () => {
      if (!workoutId) return;

      try {
        const result = await client.fetch(getWorkoutRecordQuery, { workoutId });
        setWorkout(result);
      } catch (error) {
        console.error('Error fetching workout record:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutRecord();
  }, [workoutId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Unknown Time';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return 'Duration not recorded';
    return formatDuration(seconds);
  };

  const getTotalSets = () => {
    return (
      workout?.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets?.length || 0);
      }, 0) || 0
    );
  };

  const getTotalVolume = (workout: GetWorkoutRecordQueryResult) => {
    let totalVolume = 0;
    let unit = 'lbs';

    workout?.exercises?.forEach((exercise) => {
      exercise.sets?.forEach((set) => {
        if (set.weight && set.reps) {
          totalVolume += set.weight * set.reps;
          unit = set.weightUnit || 'lbs';
        }
      });
    });
    return { volume: totalVolume, unit };
  };

  const handleDeleteWorkout = async () => {};

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading workout record...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1  bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">Workout not found.</Text>
          <Text className="mt-2 text-center text-gray-600">
            This workout record could not be found.
          </Text>
          <TouchableOpacity
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3"
            onPress={() => {
              router.back();
            }}>
            <Text className="font-medium text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { volume, unit } = getTotalVolume(workout);
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1">
        {/* Workout Summary */}
        <View className="border-b border-gray-300 bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">Workout Summary</Text>
            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-red-600 px-4 py-2"
              disabled={deleting}
              onPress={handleDeleteWorkout}>
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  <Text className="ml-2 font-medium text-white">Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="mb-3 flex-row items-center">
            <Ionicons name="calendar-outline" size={20} color={'#6B7280'} />
            <Text className="ml-3 font-medium text-gray-700">
              {formatDate(workout?.date as string)} at {formatTime(workout?.date as string)}
            </Text>
          </View>

          <View className="mb-3 flex-row items-center">
            <Ionicons name="time-outline" size={20} color={'#6B7280'} />
            <Text className="ml-3 font-medium text-gray-700">
              {formatWorkoutDuration(workout?.duration as number)}
            </Text>
          </View>

          <View className="mb-3 flex-row items-center">
            <Ionicons name="fitness-outline" size={20} color={'#6B7280'} />
            <Text className="ml-3 font-medium text-gray-700">
              {workout?.exercises?.length || 0} exercises
            </Text>
          </View>

          <View className="mb-3 flex-row items-center">
            <Ionicons name="bar-chart-outline" size={20} color={'#6B7280'} />
            <Text className="ml-3 font-medium text-gray-700">{getTotalSets()} sets</Text>
          </View>

          {volume > 0 && (
            <View className="mb-3 flex-row items-center">
              <Ionicons name="barbell-outline" size={20} color={'#6B7280'} />
              <Text className="ml-3 font-medium text-gray-700">
                {volume.toLocaleString()} {unit} total volume
              </Text>
            </View>
          )}
        </View>

        {/* Workout list */}
        <View className="gap-4 space-y-4 p-6">
          {workout?.exercises?.map((exerciseData, index) => (
            <View
              key={exerciseData._key}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {/* exercise header */}
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {exerciseData.exercise?.name || 'Unknown Exercise'}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-600">
                    {exerciseData.sets?.length || 0} set{exerciseData.sets?.length !== 1 ? 's' : ''}{' '}
                    completed
                  </Text>
                </View>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Text className="font-bold text-blue-600">{index + 1}</Text>
                </View>
              </View>

              {/* sets list */}
              <View className="space-y-2">
                <Text className="mb-2 text-sm font-medium text-gray-700">Sets:</Text>
                {exerciseData.sets?.map((set, setIndex) => (
                  <View
                    key={set._key}
                    className="flex-row items-center justify-between rounded-lg bg-gray-50 p-3">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                        <Text className="text-xs font-medium text-gray-700">{setIndex + 1}</Text>
                      </View>
                      <Text className="font-medium text-gray-900">{set?.reps} reps</Text>
                    </View>

                    {set.weight && (
                      <View className="flex-row items-center">
                        <Ionicons name="barbell-outline" size={16} color={'#6B7280'} />
                        <Text className="ml-2 font-medium text-gray-700">
                          {set.weight} {set.weightUnit || 'lbs'}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* exercise volume summary */}
              {exerciseData.sets && exerciseData.sets.length > 0 && (
                <View className="mt-4 border-t border-gray-100 pt-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">Exercise Volume:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {exerciseData.sets
                        .reduce((total, set) => {
                          return total + (set.weight || 0) * (set.reps || 0);
                        }, 0)
                        .toLocaleString()}{' '}
                      {exerciseData.sets[0]?.weightUnit || 'lbs'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
