import { useCallback } from "react";
import { useRouter, type RelativePathString } from "expo-router";
import { useSubscriptionStore } from "./useSubscriptionStore";

/**
 * Hook to gate premium features.
 * Returns a guard function that either allows the action or navigates to paywall.
 */
export function usePaywall() {
  const router = useRouter();
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const requirePremium = useCallback(
    (onAllowed: () => void) => {
      if (isPremium) {
        onAllowed();
      } else {
        router.push("/paywall" as RelativePathString);
      }
    },
    [isPremium, router]
  );

  return { isPremium, requirePremium };
}
