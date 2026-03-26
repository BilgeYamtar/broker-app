import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { colors } from "@/constants/colors";

export default function RootIndex() {
  const [hydrated, setHydrated] = useState(
    useOnboardingStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    const unsub = useOnboardingStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return () => { unsub(); };
  }, [hydrated]);

  const hasCompleted = useOnboardingStore((s) => s.hasCompletedOnboarding);

  // Wait for AsyncStorage hydration before routing
  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.maritime.base }} />
    );
  }

  if (!hasCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/cargo" />;
}
