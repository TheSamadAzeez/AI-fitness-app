import { urlFor } from '@/src/lib/sanity/client';
import { Exercise } from '@/src/lib/sanity/types';
import { Ionicons } from '@expo/vector-icons';
import { Image, TouchableOpacity } from 'react-native';
import { View, Text } from 'react-native';

const getDifficuiltyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-500';
    case 'Intermediate':
      return 'bg-yellow-500';
    case 'Advanced':
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

interface ExerciseCardProps {
  item: Exercise;
  onPress: () => void;
  showChevron?: boolean;
}

export default function ExerciseCard({ item, onPress, showChevron }: ExerciseCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <View className="flex-row p-6">
        <View className="mr-4 h-20 w-20 overflow-hidden rounded-xl bg-white">
          {item.image && item?.image?.asset?._ref ? (
            <Image
              source={{ uri: urlFor(item.image.asset._ref).url() }}
              className="h-full w-full"
              resizeMode="contain"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <Ionicons name="fitness" size={24} color="white" />
            </View>
          )}
        </View>

        {/* details */}
        <View className="flex-1 justify-between">
          <View>
            <Text className="mb-1 text-lg font-bold text-gray-900">{item.name}</Text>
            <Text className="mb-2 text-sm text-gray-600" numberOfLines={2}>
              {item.description || 'No description available.'}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View
              className={`rounded-full px-3 py-1 ${getDifficuiltyColor(item?.difficulty?.toUpperCase() as string)}`}>
              <Text className="text-xs font-semibold text-white">
                {getDifficuiltyText(item?.difficulty?.toLowerCase() as string)}
              </Text>
            </View>

            {showChevron && (
              <TouchableOpacity className="p-2">
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
