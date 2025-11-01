import { Exercise } from '@/src/lib/sanity/types';
import { useWorkoutStore } from '@/store/workout-store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, Modal } from 'react-native';

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
      <Text>Exercise Selection Modal</Text>
    </Modal>
  );
}
