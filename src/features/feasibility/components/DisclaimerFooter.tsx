import { View, Text } from "react-native";
import { useI18n } from "@/lib/i18n";

export function DisclaimerFooter() {
  const { t } = useI18n();

  return (
    <View className="mb-8 px-2 py-3 border-t border-maritime-border">
      <Text className="text-maritime-muted text-xs text-center leading-5">
        {t("disclaimer.text")}
      </Text>
    </View>
  );
}
