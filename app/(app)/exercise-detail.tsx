import { client, urlFor } from '@/src/lib/sanity/client';
import { Exercise } from '@/src/lib/sanity/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';

// Helper functions for difficulty display
const getDifficuiltyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500';
    case 'intermediate':
      return 'bg-yellow-500';
    case 'advanced':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getDifficuiltyText = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
    default:
      return 'Unknown';
  }
};

// GROQ query to fetch a single exercise by ID
export const singleExerciseQuery = defineQuery(`*[_type == "exercise" && _id == $id][0]`);

export default function ExerciseDetail() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiGuidance, setAIGuidance] = useState<string>();
  const [aiLoading, setAILoading] = useState(false);

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) return;

      try {
        const exerciseData = await client.fetch(singleExerciseQuery, { id });
        setExercise(exerciseData);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  //   Fetch AI guidance for the exercise
  const getAiGuidance = async () => {
    if (!exercise) return;

    setAILoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ exerciseName: exercise.name }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI guidance');
      }

      const data = await response.json();
      setAIGuidance(data.guidance);
    } catch (error) {
      console.error('Error fetching AI guidance:', error);
      setAIGuidance('Sorry, there was an error getting AI guidance. Please try again.');
    } finally {
      setAILoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1  bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={'#0000ff'} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* Header with a close button */}
      <View className="absolute left-0 right-0 top-12 z-10 px-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
          onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View className="relative h-80 bg-white">
          {exercise?.image && exercise?.image?.asset?._ref ? (
            <Image
              source={{ uri: urlFor(exercise.image.asset._ref).url() }}
              className="h-full w-full"
              resizeMode="contain"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <Ionicons name="fitness" size={80} color="white" />
            </View>
          )}

          {/* Gradient overlay */}
          <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {/* Title and difficulty */}
          <View className="mb-4 flex-row items-start justify-between">
            <View className="mr-4 flex-1">
              <Text className="mb-2 text-3xl font-bold text-gray-800">{exercise?.name}</Text>
              <View
                className={`self-start rounded-full px-4 py-2 ${getDifficuiltyColor(exercise?.difficulty as string)}`}>
                <Text className="text-sm font-semibold text-white">
                  {getDifficuiltyText(exercise?.difficulty as string)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="mb-3 text-xl font-semibold text-gray-800">Description</Text>
            <Text className="text-base leading-6 text-gray-600">
              {exercise?.description || 'No description available for this exercise.'}
            </Text>
          </View>

          {/* Video */}
          {exercise?.videoUrl && (
            <View className="mb-6">
              <Text className="mb-3 text-xl font-semibold text-gray-800">Video Tutorial</Text>
              <TouchableOpacity
                className="flex-row items-center rounded-xl bg-red-500 p-4"
                onPress={() => {
                  if (exercise?.videoUrl) {
                    Linking.openURL(exercise.videoUrl);
                  }
                }}>
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-white">
                  <Ionicons name="play" size={24} color="#EF4444" />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-white">Watch Tutorial</Text>
                  <Text className="text-sm text-red-100">Learn proper form</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/*AI guidance */}
          {(aiGuidance || aiLoading) && (
            <View className="mb-6">
              <View className="mb-3 flex-row items-center">
                <Ionicons name="fitness" size={24} color={'#3882F6'} />
                <Text className="ml-2 text-xl font-semibold text-gray-800">AI coach says...</Text>
              </View>

              {aiLoading ? (
                <View className="bg-gray-50r items-center rounded-xl p-4">
                  <ActivityIndicator size={'small'} color={'#3882F6'} />
                  <Text className="mt-2 text-gray-600">Getting personalized guidance</Text>
                </View>
              ) : (
                <View className="rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4">
                  <Markdown
                    style={{
                      body: { paddingBottom: 20 },
                      heading2: {
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginTop: 12,
                        marginBottom: 6,
                        color: '#1f2937',
                      },
                      heading3: {
                        fontSize: 16,
                        fontWeight: '600',
                        marginTop: 8,
                        marginBottom: 4,
                      },
                    }}>
                    {aiGuidance}
                  </Markdown>
                </View>
              )}
            </View>
          )}

          {/* Action buttons  */}
          <View className="mt-8 gap-2">
            {/* AI coaching button */}
            <TouchableOpacity
              className={`items-center rounded-xl py-4 ${aiLoading ? 'bg-gray-400' : aiGuidance ? 'bg-green-500' : 'bg-blue-500'}`}
              disabled={aiLoading}
              onPress={() => getAiGuidance()}>
              {aiLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="ml-2 text-lg font-bold text-white">Loading</Text>
                </View>
              ) : (
                <Text className="text-lg font-bold text-white">
                  {aiGuidance ? 'Refresh AI Guidance' : 'Get AI Guidance on this Exercise '}
                </Text>
              )}
            </TouchableOpacity>

            {/* close button */}
            <TouchableOpacity
              className="items-center rounded-xl bg-gray-200 p-4"
              onPress={() => {
                router.back();
              }}>
              <Text className="text-lg font-bold text-gray-800">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
