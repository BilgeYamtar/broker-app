import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { colors } from "@/constants/colors";

export default function OnboardingScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const completeOnboarding = useOnboardingStore(
    (s) => s.completeOnboarding
  );

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace("/(tabs)/cargo");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.maritime.base }}
      edges={["top", "bottom"]}
    >
      <View className="flex-1 justify-center items-center px-8">
        {/* App name */}
        <Text className="text-maritime-teal text-lg font-semibold tracking-widest uppercase mb-2">
          {t("onboarding.appName")}
        </Text>

        {/* Welcome heading */}
        <Text className="text-maritime-white text-3xl font-bold mb-6">
          {t("onboarding.welcome")}
        </Text>

        {/* Description */}
        <Text className="text-maritime-muted text-base text-center leading-6 mb-4">
          {t("onboarding.description")}
        </Text>

        {/* Demo data info */}
        <Text className="text-maritime-muted text-sm text-center leading-5 mb-12">
          {t("onboarding.demoDataInfo")}
        </Text>
      </View>

      {/* Get Started button */}
      <View className="px-8 mb-8">
        <Button
          label={t("onboarding.getStarted")}
          onPress={handleGetStarted}
          variant="primary"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
