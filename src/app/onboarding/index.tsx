import { View, Text } from "react-native";
import { ScreenContainer } from "@/components/layout/ScreenContainer";

export default function OnboardingScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center">
        <Text className="text-maritime-white text-xl font-semibold">
          Hoş geldiniz
        </Text>
        <Text className="text-maritime-muted text-sm mt-2">
          Onboarding akışı burada oluşturulacak
        </Text>
      </View>
    </ScreenContainer>
  );
}
