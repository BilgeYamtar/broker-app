import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import { DatabaseProvider } from "@/lib/DatabaseProvider";
import { initializeRevenueCat } from "@/services/subscriptionService";
import { useSubscriptionStore } from "@/features/subscription/useSubscriptionStore";

export default function RootLayout() {
  const loadSubscription = useSubscriptionStore((s) => s.loadSubscription);

  useEffect(() => {
    initializeRevenueCat().then(() => {
      loadSubscription();
    });
  }, [loadSubscription]);

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
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="paywall"
          options={{ animation: "slide_from_bottom", presentation: "modal" }}
        />
      </Stack>
    </DatabaseProvider>
  );
}
