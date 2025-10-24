import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import type { Exercise } from '../../../sanity/sanity.types';
import ExerciseCard from '@/components/ExerciseCard';
import { defineQuery } from 'groq';
import { client } from '@/src/lib/sanity/client';

// define the GROQ query to fetch exercises outside the component to avoid re-creation on each render
export const exercisesQuery = defineQuery('*[_type == "exercise"]{...}');

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);

  const router = useRouter();

  const fetchExercises = async () => {
    try {
      const exercises = await client.fetch(exercisesQuery);
      setExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900">Exercises Library</Text>
        <Text className="mt-1 text-gray-600">Discover and master new exercises</Text>

        {/* search bar */}
        <View className="mt-4 flex-row items-center rounded-xl bg-gray-100 px-4 py-3">
          <Ionicons name="search" size={20} color="#687280" />
          <TextInput
            placeholder="Search exercises..."
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-gray-800"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#687280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* exercise list */}
      <FlatList
        data={[] as any}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => router.push(`/exercise-detail?id=${item._id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3882F6']} // Android
            tintColor="#3882F6" // iOS
            title="Pull to refresh exercises" // iOS
            titleColor="#687280" // iOS}
          />
        }
        ListEmptyComponent={
          <View className="items-center rounded-2xl bg-white p-8">
            <Ionicons name="fitness-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-900">
              {searchQuery ? 'No exercises found' : 'Loading exercises...'}
            </Text>
            <Text className="mt-2 text-center text-gray-600">
              {searchQuery ? 'Try adjusting your search' : 'Your exercise will appear here'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
