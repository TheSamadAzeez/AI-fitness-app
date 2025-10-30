import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Workout() {
  const router = useRouter();

  const startWorkout = () => {
    // Navigate to active workout screen
    router.push('/active-workout');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      {/* main start workout screen */}
      <View className="flex-1 px-6">
        <View className="pb-6 pt-8">
          <Text className="mb-3 text-3xl font-bold text-gray-900">Ready to train?</Text>
          <Text className="text-lg text-gray-600">Start your workout session</Text>
        </View>
      </View>

      {/* start workout card*/}
      <View className="mx-6 mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="fitness" size={24} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-xl font-semibold text-gray-900">Start Workout</Text>
              <Text className="text-gray-500">Begin your training session</Text>
            </View>
          </View>
          <View className="rounded-full bg-green-100 px-3 py-1">
            <Text className="text-sm font-medium text-green-700">Ready</Text>
          </View>
        </View>

        {/* start button */}
        <TouchableOpacity
          onPress={startWorkout}
          className="items-center rounded-2xl bg-blue-600 py-4 active:bg-blue-700"
          activeOpacity={0.8}>
          <View className="flex-row items-center">
            <Ionicons name="play" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-lg font-semibold text-white">Start Workout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
