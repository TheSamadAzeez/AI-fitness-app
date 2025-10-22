import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    console.log(emailAddress, password);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/');
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <View className="flex-1 px-6">
            <View className="flex-1 justify-center">
              {/* Logo Branding */}
              <View className="mb-8 items-center">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <Ionicons name="mail" size={40} color="white" />
                </View>
                <Text className="mb-2 text-3xl font-bold text-gray-900">Check Your Email</Text>
                <Text className="text-center text-lg text-gray-600">
                  We&apos;ve sent you a verification code to{'\n'}
                  {emailAddress}.
                </Text>
              </View>

              {/* Verification Form */}
              <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
                  Enter Verification Code
                </Text>
                <View className="mb-6 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <Ionicons name="key-outline" size={20} color="#687280" />
                  <TextInput
                    className="ml-3 flex-1 text-center text-lg tracking-widest text-gray-900"
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={'#9CA3AF'}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                  />
                </View>

                {/* verify button */}
                <TouchableOpacity
                  onPress={onVerifyPress}
                  disabled={isLoading}
                  className={` rounded-xl ${Platform.OS === 'ios' ? 'py-4' : 'py-3'} shadow-sm ${isLoading ? 'bg-gray-400' : 'bg-green-600'}`}
                  activeOpacity={0.8}>
                  <View className=" flex-row items-center justify-center">
                    {isLoading ? (
                      <Ionicons name="refresh" size={20} color="white" />
                    ) : (
                      <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                    )}
                    <Text className="ml-2 text-lg font-semibold text-white">
                      {isLoading ? 'Verifying...' : 'Verify Email'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* resend code */}
                <TouchableOpacity className="py-2">
                  <Text className="text-center font-medium text-blue-600">
                    Didn&apos;t receive the code? Resend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* footer */}
            <View className="pb-6">
              <Text className="text-center text-sm text-gray-500">
                Almost there! Just one more step
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 px-6">
          {/* main content */}
          <View className="flex-1 justify-center">
            {/* Logo Branding */}
            <View className="mb-8 items-center">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                <Ionicons name="fitness" size={40} color="white" />
              </View>
              <Text className="mb-2 text-3xl font-bold text-gray-900">Join FitTracker</Text>
              <Text className="text-center text-lg text-gray-600">
                Track your fitness journey{'\n'}and reach your goals
              </Text>
            </View>

            {/* Sign Up Form */}
            <View className=" rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
                Create your account
              </Text>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Email</Text>
                <View
                  className={`flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 ${Platform.OS === 'ios' ? 'py-4' : 'py-3'}`}>
                  <Ionicons name="mail-outline" size={20} color="#687280" />
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor={'#9CA3AF'}
                    onChangeText={(email) => setEmailAddress(email)}
                    className="ml-3 flex-1 text-gray-900"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
                <View
                  className={`flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 ${Platform.OS === 'ios' ? 'py-4' : 'py-3'}`}>
                  <Ionicons name="lock-closed-outline" size={20} color="#687280" />
                  <TextInput
                    placeholder="Create your password"
                    placeholderTextColor={'#9CA3AF'}
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                    className="ml-3 flex-1 text-gray-900"
                  />
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={onSignUpPress}
                disabled={isLoading}
                className={`mb-4 rounded-xl ${Platform.OS === 'ios' ? 'py-4' : 'py-3'} shadow-sm ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
                activeOpacity={0.8}>
                <View className=" flex-row items-center justify-center">
                  {isLoading ? (
                    <Ionicons name="refresh" size={20} color="white" />
                  ) : (
                    <Ionicons name="person-add-outline" size={20} color="white" />
                  )}
                  <Text className="ml-2 text-lg font-semibold text-white">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Terms */}
              <Text className="mb-4 text-center text-xs text-gray-500">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>
          </View>

          {/* sign in link */}
          <View className="flex-row items-center justify-center">
            <Text className=" text-gray-600">Already have an account?</Text>
            <Link href={'/sign-in'} asChild>
              <TouchableOpacity>
                <Text className="font-semibold text-blue-600">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* footer */}
          <View className="pb-6 pt-2">
            <Text className="text-center text-sm text-gray-500">
              Ready to transform your fitness?
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
