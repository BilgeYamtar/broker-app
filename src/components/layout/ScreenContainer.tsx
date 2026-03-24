import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
  padded?: boolean;
}

export function ScreenContainer({
  children,
  padded = true,
}: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-maritime-base" edges={["top"]}>
      <View className={`flex-1 ${padded ? "px-4" : ""}`}>{children}</View>
    </SafeAreaView>
  );
}
