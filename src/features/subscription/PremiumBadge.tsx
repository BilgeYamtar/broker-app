import { View, Text } from "react-native";
import { useSubscriptionStore } from "./useSubscriptionStore";

interface PremiumBadgeProps {
  compact?: boolean;
}

export function PremiumBadge({ compact }: PremiumBadgeProps) {
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  if (isPremium) return null;

  if (compact) {
    return (
      <View className="bg-amber-900/40 rounded px-1.5 py-0.5 ml-1">
        <Text className="text-amber-400 text-[10px] font-bold">PRO</Text>
      </View>
    );
  }

  return (
    <View className="bg-amber-900/40 rounded-full px-2.5 py-1">
      <Text className="text-amber-400 text-xs font-bold">Premium</Text>
    </View>
  );
}
