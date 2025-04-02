import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../hooks/AuthContext";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "@/hooks/useColorScheme";
import * as SystemUI from "expo-system-ui";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    "Gotham-Bold": require("../assets/fonts/Gotham-Bold.otf"),
    "Gotham-Book": require("../assets/fonts/Gotham-Book.otf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SystemUI.setBackgroundColorAsync(COLORS(colorScheme).BACKGROUND);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";
    const inOnboarding = segments[0] === "onboarding";

    if (!session && !inAuthGroup && !inOnboarding) {
      // Redirect to login if not authenticated
      console.log("Redirecting to login");
      router.replace("/login");
    } else if (session && (inAuthGroup || inOnboarding)) {
      // Redirect to home if authenticated and trying to access auth screens
      router.replace("/(tabs)");
    }
  }, [session, segments, isLoading]);

  if (!fontsLoaded) {
    return null;
  }

  return [];
}

export default () => {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: COLORS(colorScheme).BACKGROUND,
          },
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: COLORS(colorScheme).BACKGROUND,
            },
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <RootLayout />
    </AuthProvider>
  );
};
