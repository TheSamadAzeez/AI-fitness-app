import { Exercise } from '@/src/lib/sanity/types';
import { useWorkoutStore } from '@/store/workout-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, Modal, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ExerciseSelectionModal({ visible, onClose }: ExerciseSelectionModalProps) {
  const router = useRouter();
  const { addExerciseToWorkout } = useWorkoutStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
      </SafeAreaView>
    </Modal>
  );
}
