import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GoogleSignInButton from './components/google-signin';

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 px-6">
          {/* Heading section*/}
          <View className="flex-1 justify-center">
            {/* Logo Branding */}
            <View className="mb-8 items-center">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                <Ionicons name="fitness" size={40} color="white" />
              </View>
              <Text className="mb-2 text-3xl font-bold text-gray-900">FitTracker</Text>
              <Text className="text-center text-lg text-gray-600">
                Track your fitness journey{'\n'}and reach your goals
              </Text>
            </View>

            {/* Sign in form */}
            <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <Text className="mb-6 text-center text-2xl font-bold text-gray-900">
                Welcome back!
              </Text>

              {/* Email input */}
              <View className={`${Platform.OS === 'ios' ? 'mb-4' : 'mb-2'}`}>
                <Text className="mb-2 text-sm font-medium text-gray-700">Email</Text>
                <View
                  className={`${Platform.OS === 'ios' ? 'py-4' : 'py-3'} flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4`}>
                  <Ionicons name="mail-outline" size={20} color="#687280" />
                  <TextInput
                    autoCapitalize="none"
                    placeholder="Enter your Email"
                    placeholderTextColor={'#9CA3AF'}
                    value={emailAddress}
                    onChangeText={(email) => setEmailAddress(email)}
                    editable={!isLoading}
                    className="ml-3 flex-1 text-gray-900"
                  />
                </View>
              </View>

              {/* Password input */}
              <View className={`${Platform.OS === 'ios' ? 'mb-6' : 'mb-2'}`}>
                <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
                <View
                  className={`${Platform.OS === 'ios' ? 'py-4' : 'py-3'} flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4`}>
                  <Ionicons name="lock-closed-outline" size={20} color="#687280" />
                  <TextInput
                    placeholder="Enter your Password"
                    placeholderTextColor={'#9CA3AF'}
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                    className="ml-3 flex-1 text-gray-900"
                  />
                </View>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={onSignInPress}
              disabled={isLoading}
              className={` rounded-xl ${Platform.OS === 'ios' ? 'py-4' : 'py-3'} shadow-sm ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
              activeOpacity={0.8}>
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <Ionicons name="refresh" size={20} color="white" />
                ) : (
                  <Ionicons name="log-in-outline" size={20} color="white" />
                )}
                <Text className="ml-2 text-lg font-semibold text-white">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View className="my-2 flex-row items-center">
              <View className="h-px flex-1 bg-gray-200" />
              <Text className="px-4 text-sm text-gray-500">OR</Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            {/* Google sign in button */}
            <GoogleSignInButton />

            {/* Sign Up Link */}
            <View className="flex-row items-center justify-center">
              <Text className=" text-gray-600">Don&apos;t have an account?</Text>
              <Link href={'/sign-up'} className="" asChild>
                <TouchableOpacity>
                  <Text className="font-semibold text-blue-600">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Footer Section */}
          <View className="pb-6">
            <Text className="text-center text-sm text-gray-500">
              Start your fitness journey today
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
