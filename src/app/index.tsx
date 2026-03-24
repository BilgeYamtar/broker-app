import { Redirect } from "expo-router";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";

export default function RootIndex() {
  const hasCompleted = useOnboardingStore((s) => s.hasCompletedOnboarding);

  if (!hasCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/cargo" />;
}
