import { useWorkoutStore } from '@/store/workout-store';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useStopwatch } from 'react-timer-hook';

export default function ActiveWorkout() {
  const router = useRouter();
  const {
    addExerciseToWorkout,
    setWorkoutExercises,
    setWeightUnit,
    resetWorkout,
    weightUnit,
    workoutExercises,
  } = useWorkoutStore();
  const { seconds, minutes, hours, totalSeconds, reset } = useStopwatch({ autoStart: true }); // use the stopwatch hook to track workout duration

  useFocusEffect(
    // reset the workout if there are no exercises when the screen is focused (fresh start)
    React.useCallback(() => {
      // only reset if there are no exercises (indicates a fresh start after ending previous workout)
      if (workoutExercises.length === 0) {
        reset();
      }
    }, [workoutExercises.length, reset])
  );

  // Get the formatted workout duration.
  const getWorkoutDuration = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const cancelWorkout = () => {
    Alert.alert('Cancel Workout', 'Are you sure you want to cancel the workout?', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'End Workout',
        style: 'destructive',
        onPress: () => {
          resetWorkout();
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor={'#1F2937'} />

      {/* Top safe area */}
      <View
        className=" bg-gray-800"
        style={{ paddingTop: Platform.OS === 'ios' ? 55 : StatusBar.currentHeight || 0 }}
      />
      {/* Header */}
      <View className="bg-gray-800 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-semibold text-white">Active Workout</Text>
            <Text className="text-gray-300">{getWorkoutDuration()}</Text>
          </View>
          <View className="flex-row items-center gap-2 space-x-3">
            {/* weight unit toggle */}
            <View className="flex-row rounded-lg bg-gray-700 p-1">
              <TouchableOpacity
                onPress={() => setWeightUnit('lbs')}
                className={`rounded px-3 py-1 ${weightUnit === 'lbs' ? 'bg-blue-600' : ''}`}>
                <Text
                  className={`text-sm font-medium ${weightUnit === 'lbs' ? 'text-white' : 'text-gray-300'}`}>
                  lbs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWeightUnit('kg')}
                className={`rounded px-3 py-1 ${weightUnit === 'kg' ? 'bg-blue-600' : ''}`}>
                <Text
                  className={`text-sm font-medium ${weightUnit === 'kg' ? 'text-white' : 'text-gray-300'}`}>
                  kg
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={cancelWorkout} className="rounded-lg bg-red-600 px-4 py-2">
              <Text className="font-medium text-white">End</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* content area with white background */}
      <View className="flex-1 bg-white">
        {/* workout progress */}
        <View className="mt-4 px-6">
          <Text className="mb-2 text-center text-gray-600">
            {workoutExercises.length} {workoutExercises.length === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>
        {/* if no exercises are present, show a message */}
        {workoutExercises.length === 0 && (
          <View className="mx-6 items-center rounded-2xl bg-gray-50 p-8">
            <Ionicons name="barbell-outline" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-center text-lg font-medium text-gray-600">
              No exercises added yet
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Get started by adding your first exercise below.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
