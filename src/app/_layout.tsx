import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import { DatabaseProvider } from "@/lib/DatabaseProvider";

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <StatusBar style="light" backgroundColor={colors.maritime.base} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.maritime.base },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack>
    </DatabaseProvider>
  );
}
