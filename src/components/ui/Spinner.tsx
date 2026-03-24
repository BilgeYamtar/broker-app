import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "@/constants/colors";

interface SpinnerProps {
  label?: string;
  size?: "small" | "large";
}

export function Spinner({ label, size = "large" }: SpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size={size} color={colors.maritime.teal} />
      {label && (
        <Text className="text-maritime-muted text-sm mt-3">{label}</Text>
      )}
    </View>
  );
}
