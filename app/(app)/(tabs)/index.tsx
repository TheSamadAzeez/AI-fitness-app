import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Page() {
  return (
    <SafeAreaView className="flex flex-1">
      <Header />
      <Content />
    </SafeAreaView>
  );
}

function Content() {
  return (
    <View className="flex-1">
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="px-4 md:px-6">
          <View className="flex flex-col items-center gap-4 text-center">
            <Text
              role="heading"
              className="native:text-5xl text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Expo + Tailwind (NativeWind) Template
            </Text>

            <Text className="mx-auto max-w-[700px] text-center text-lg md:text-xl">
              This template sets up Expo and Tailwind (NativeWind) allowing you to quickly get
              started with my YouTube tutorial!
            </Text>
            <Link href="https://www.youtube.com/@sonnysangha" target="_blank">
              <Text className="text-center text-lg text-blue-500 underline hover:text-blue-700 md:text-xl dark:text-blue-400 dark:hover:text-blue-300">
                https://www.youtube.com/@sonnysangha
              </Text>
            </Link>

            <View className="gap-4">
              <Link
                suppressHighlighting
                className="ios:shadow flex h-9 items-center justify-center overflow-hidden rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 transition-colors hover:bg-gray-900/90 focus-visible:ring-gray-950 active:bg-gray-400/90 disabled:pointer-events-none disabled:opacity-50 web:shadow web:focus-visible:outline-none web:focus-visible:ring-1 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                href="https://www.youtube.com/@sonnysangha">
                Visit my YouTube Channel
              </Link>
            </View>

            <View className="gap-4">
              <Link
                suppressHighlighting
                className="ios:shadow flex h-9 items-center justify-center overflow-hidden rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-gray-50 transition-colors hover:bg-gray-900/90 focus-visible:ring-gray-950 active:bg-gray-400/90 disabled:pointer-events-none disabled:opacity-50 web:shadow web:focus-visible:outline-none web:focus-visible:ring-1 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                href="https://www.papareact.com/course">
                Get the Complete Source Code (Plus 60+ builds) ❤️
              </Link>
            </View>

            <View className="gap-4">
              <Link
                suppressHighlighting
                className="ios:shadow flex h-9 items-center justify-center overflow-hidden rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-gray-50 transition-colors hover:bg-gray-900/90 focus-visible:ring-gray-950 active:bg-gray-400/90 disabled:pointer-events-none disabled:opacity-50 web:shadow web:focus-visible:outline-none web:focus-visible:ring-1 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                href="https://www.papareact.com/course">
                Join My Course & Learn to Code with AI 💚 (1000+ Students)
              </Link>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Header() {
  return (
    <View>
      <View className="flex h-14 flex-row items-center justify-between px-4 lg:px-6 ">
        <Link className="flex-1 items-center justify-center font-bold" href="/">
          PAPAFAM
        </Link>
        <View className="">
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="https://www.papareact.com/course">
            Join My Course ❤️
          </Link>
        </View>
      </View>
    </View>
  );
}
