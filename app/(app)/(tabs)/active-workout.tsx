import { client } from '@/src/lib/sanity/client';
import { useWorkoutStore, WorkoutSet } from '@/store/workout-store';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStopwatch } from 'react-timer-hook';
import { ExerciseSelectionModal } from '../components/exercise-modal';
import { WorkoutData } from '../api/save-workout+api';

// GROQ query to find exercise by name
const findExerciseQuery = defineQuery(`*[_type == "exercise" && name == $name][0]{_id, name}`);

export default function ActiveWorkout() {
  const { user } = useUser();
  const [showExerciseSelectionScreen, setShowExerciseSelectionScreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { setWorkoutExercises, setWeightUnit, resetWorkout, weightUnit, workoutExercises } =
    useWorkoutStore();
  const { seconds, minutes, totalSeconds, reset } = useStopwatch({ autoStart: true }); // use the stopwatch hook to track workout duration

  // Reset the workout if there are no exercises when the screen is focused (fresh start)
  useFocusEffect(
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

  // Cancel the workout with confirmation
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

  // Open exercise selection modal
  const addExercise = () => {
    setShowExerciseSelectionScreen(true);
  };

  // Delete an exercise from the workout with confirmation
  const deleteExercise = (exerciseId: string) => {
    setWorkoutExercises(workoutExercises.filter((exercise) => exercise.id !== exerciseId));
  };

  // Add a new set to an exercise
  const addNewSet = (exerciseId: string) => {
    const newSet: WorkoutSet = {
      id: Math.random().toString(36), // simple unique id
      reps: '',
      weight: '',
      weightUnit: weightUnit,
      isCompleted: false,
    };

    setWorkoutExercises((prevExercises) => {
      return prevExercises.map((exercise) => {
        return exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise;
      });
    });
  };

  // Update a set's reps or weight
  const updateSet = (
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string
  ) => {
    setWorkoutExercises((prevExercises) => {
      return prevExercises.map((exercise) => {
        return exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : exercise;
      });
    });
  };

  // Toggle a set's completion status
  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setWorkoutExercises((prevExercises) => {
      return prevExercises.map((exercise) => {
        return exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, isCompleted: !set.isCompleted } : set
              ),
            }
          : exercise;
      });
    });
  };

  // Delete a set from an exercise
  const deleteSet = (exerciseId: string, setId: string) => {
    setWorkoutExercises((prevExercises) => {
      return prevExercises.map((exercise) => {
        return exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise;
      });
    });
  };

  // Save the workout to the database
  const saveWorkoutToDatabase = async () => {
    if (isSaving) return false; // prevent multiple saves

    setIsSaving(true);

    try {
      // implementing saving ...
      // use stopwatch totalSeconds as duration
      const durationInSeconds = totalSeconds;

      // Transform the workout data to match the expected schema
      const exercisesForSanity = await Promise.all(
        workoutExercises.map(async (exercise) => {
          // find the exercise document in sanity by name
          const exerciseDoc = await client.fetch(findExerciseQuery, { name: exercise.name });

          if (!exerciseDoc) {
            throw new Error(`Exercise: ${exercise.name} not found in database`);
          }

          // Transform sets to match schema (only completed sets, convert to numbers)
          const setsForSanity = exercise.sets
            .filter((set) => set.isCompleted && set.reps && set.weight)
            .map((set) => ({
              _type: 'set',
              _key: Math.random().toString(36),
              reps: parseInt(set.reps, 10) || 0,
              weight: parseFloat(set.weight) || 0,
              weightUnit: set.weightUnit,
            }));

          return {
            _type: 'workoutExercise',
            _key: Math.random().toString(36).substr(2, 9),
            exercise: { _type: 'reference', _ref: exerciseDoc._id },
            sets: setsForSanity,
          };
        })
      );

      // filter out exercises with no completed sets
      const ValidExercises = exercisesForSanity.filter((exercise) => exercise.sets.length > 0);

      if (ValidExercises.length === 0) {
        Alert.alert(
          'No Completed Sets',
          'Please complete at least one set before saving the workout.'
        );
        return;
      }

      // Create the workout document
      const workoutData: WorkoutData = {
        _type: 'workout',
        userId: user?.id as string,
        date: new Date().toISOString(),
        duration: durationInSeconds,
        exercises: ValidExercises,
      };

      // Save to Sanity
      const result = await fetch('/api/save-workout', {
        method: 'POST',
        body: JSON.stringify({ workoutData }),
      });

      console.log('Workout saved successfully:', result);
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'There was an error saving your workout. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // End the workout process
  const endWorkout = async () => {
    const saved = await saveWorkoutToDatabase();

    if (saved) {
      Alert.alert('Workout Saved', 'Your workout has been saved successfully.');
      resetWorkout();

      router.replace('/(app)/(tabs)/history?refresh=true');
    }
  };

  // Save workout with confirmation
  const saveWorkout = () => {
    Alert.alert('Complete Workout', 'Are you sure you want to complete the workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          await endWorkout();
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

        {/* all exercises - vertical list */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 ">
          <ScrollView className="mt-4 flex-1 px-5">
            {workoutExercises.map((exercise) => {
              return (
                <View key={exercise.id} className="mb-8">
                  {/* Exercise header */}
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/exercise-detail',
                        params: {
                          id: exercise.sanityId,
                        },
                      })
                    }
                    className="mb-3 rounded-2xl bg-blue-50 p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="mb-2 text-xl font-bold text-gray-900">
                          {exercise.name}
                        </Text>
                        <Text className="text-gray-600">
                          {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'} :{' '}
                          {exercise.sets.filter((set) => set.isCompleted).length} completed
                        </Text>
                      </View>
                      {/* delete exercise button */}
                      <TouchableOpacity
                        onPress={() => deleteExercise(exercise.id)}
                        className="ml-3 h-10 w-10 items-center justify-center  rounded-xl bg-red-100">
                        <Ionicons name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  {/* Exercise Sets */}
                  <View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <Text className="mb-3 text-lg font-semibold text-gray-900">Sets</Text>
                    {exercise.sets.length === 0 ? (
                      <Text className="py-4 text-center text-gray-500">
                        No sets yet. Add your first set below.
                      </Text>
                    ) : (
                      exercise.sets.map((set, setIndex) => {
                        return (
                          <View
                            key={set.id}
                            className={`mb-2 rounded-lg border px-3 py-3 ${set.isCompleted ? 'border-green-300 bg-green-100' : 'border-gray-200 bg-gray-50'}`}>
                            {/* first row: set number, reps, weight, complete button, delete button */}
                            <View className="flex-row items-center justify-between">
                              <Text className="w-8 font-medium text-gray-700">{setIndex + 1}</Text>
                              {/* reps input */}
                              <View className="mx-2 flex-1">
                                <Text className="mb-1 text-xs text-gray-500">Reps</Text>
                                <TextInput
                                  value={set.reps}
                                  onChangeText={(value) =>
                                    updateSet(exercise.id, set.id, 'reps', value)
                                  }
                                  placeholder="0"
                                  keyboardType="numeric"
                                  className={`rounded-lg border px-3 py-2 text-center ${
                                    set.isCompleted
                                      ? 'border-gray-300 bg-gray-100 text-gray-500'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                  editable={!set.isCompleted}
                                />
                              </View>
                              {/* weight input */}
                              <View className="mx-2 flex-1">
                                <Text className="mb-1 text-xs text-gray-500">
                                  Weight ({weightUnit})
                                </Text>
                                <TextInput
                                  value={set.weight}
                                  onChangeText={(value) =>
                                    updateSet(exercise.id, set.id, 'weight', value)
                                  }
                                  placeholder="0"
                                  keyboardType="numeric"
                                  className={`rounded-lg border px-3 py-2 text-center ${
                                    set.isCompleted
                                      ? 'border-gray-300 bg-gray-100 text-gray-500'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                  editable={!set.isCompleted}
                                />
                              </View>
                              {/* complete button */}
                              <TouchableOpacity
                                className={`mx-1 h-10 w-10 items-center justify-center rounded-xl ${set.isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                                onPress={() => toggleSetCompletion(exercise.id, set.id)}>
                                <Ionicons
                                  name={set.isCompleted ? 'checkmark' : 'checkmark-outline'}
                                  size={20}
                                  color={set.isCompleted ? 'white' : '#9CA3AF'}
                                />
                              </TouchableOpacity>

                              {/* delete set button */}
                              <TouchableOpacity
                                className="ml-2 h-10 w-10 items-center justify-center rounded-xl bg-red-100"
                                onPress={() => deleteSet(exercise.id, set.id)}>
                                <Ionicons name="trash" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })
                    )}
                    {/* add new set button */}
                    <TouchableOpacity
                      className="mt-2 items-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-100 py-3"
                      onPress={() => addNewSet(exercise.id)}
                      activeOpacity={0.7}>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="add"
                          size={16}
                          color={'#3B82F6'}
                          style={{ marginRight: 6 }}
                        />
                        <Text className="font-medium text-blue-600">Add Set </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Add exercise button */}
            <TouchableOpacity
              onPress={addExercise}
              className="mb-8 items-center rounded-2xl bg-blue-600 py-4 active:bg-blue-700"
              activeOpacity={0.7}>
              <View className="flex-row items-center">
                <Ionicons name="add" size={20} color="white" style={{ marginRight: 8 }} />
                <Text className="text-lg font-semibold text-white">Add Exercise</Text>
              </View>
            </TouchableOpacity>

            {/* complete workout button */}
            <TouchableOpacity
              onPress={saveWorkout}
              className={`mb-8 items-center rounded-2xl py-4 ${
                isSaving ||
                workoutExercises.length === 0 ||
                workoutExercises.some(
                  (exercise) =>
                    exercise.sets.length > 0 && exercise.sets.some((set) => !set.isCompleted)
                )
                  ? 'bg-gray-400'
                  : 'bg-green-600 active:bg-green-700'
              }`}
              disabled={
                isSaving ||
                workoutExercises.length === 0 ||
                workoutExercises.some(
                  (exercise) =>
                    exercise.sets.length > 0 && exercise.sets.some((set) => !set.isCompleted)
                )
              }
              activeOpacity={0.7}>
              {isSaving ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="ml-2 text-lg font-semibold text-white">Saving...</Text>
                </View>
              ) : (
                <Text className="text-lg font-semibold text-white">Complete Workout</Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          {/*  */}
        </KeyboardAvoidingView>
      </View>

      {/* Exercise Selection Modal */}
      <ExerciseSelectionModal
        visible={showExerciseSelectionScreen}
        onClose={() => setShowExerciseSelectionScreen(false)}
      />
    </View>
  );
}
