import { client } from '@/src/lib/sanity/client';
import { Exercise } from '@/src/lib/sanity/types';
import { useWorkoutStore } from '@/store/workout-store';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { exercisesQuery } from '../(tabs)/exercises';
import ExerciseCard from './exercise-card';

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ExerciseSelectionModal({ visible, onClose }: ExerciseSelectionModalProps) {
  const { addExerciseToWorkout } = useWorkoutStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  //   if visible is true, fetch exercises
  useEffect(() => {
    if (visible) {
      fetchExercises();
    }
  }, [visible]);

  // Filter exercises based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter((exercise) =>
        exercise.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exercises]);

  const fetchExercises = async () => {
    try {
      const exercises = await client.fetch(exercisesQuery);

      setExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleExercisePress = (exercise: Exercise) => {
    // Add the selected exercise to the workout store in Zustand
    addExerciseToWorkout({ name: exercise.name as string, sanityId: exercise._id as string });
    onClose();
  };

  const onRefresh = async () => {
    // Implement refresh logic here
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle={'dark-content'} />

        {/* header */}
        <View className="border-b border-gray-100 bg-white px-4 pb-6 pt-4 shadow-sm">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">Add Exercise</Text>
            <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="mb-4 text-gray-600">Select an exercise to add to your workout</Text>

          {/* search bar */}
          <View className="flex-row items-center rounded-xl bg-gray-100 px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              className="ml-3 flex-1 text-gray-800"
              placeholder="Search exercises..."
              placeholderTextColor={'#9CA3AF'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* exercise list  */}
        <FlatList
          data={filteredExercises}
          renderItem={({ item }) => {
            return (
              <ExerciseCard
                item={item}
                onPress={() => {
                  handleExercisePress(item);
                }}
                showChevron={false}
              />
            );
          }}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor={'#3B82F6'}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="fitness-outline" size={64} color="#D1D5DB" />
              <Text className="mt-4 text-lg font-semibold text-gray-400">
                {searchQuery ? 'No exercises found' : 'Loading exercises...'}
              </Text>
              <Text className="mt-2 text-sm text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search terms.'
                  : 'Please wait while we load the exercises.'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}
