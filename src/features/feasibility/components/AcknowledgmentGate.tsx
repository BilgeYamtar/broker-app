import { View, Text, Modal } from "react-native";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { useSettingsStore } from "@/lib/useSettingsStore";

export function AcknowledgmentGate() {
  const { t } = useI18n();
  const acknowledged = useSettingsStore((s) => s.disclaimerAcknowledged);
  const acknowledge = useSettingsStore((s) => s.acknowledgeDisclaimer);

  if (acknowledged) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View className="flex-1 bg-black/70 items-center justify-center px-6">
        <View className="bg-maritime-card border border-maritime-border rounded-2xl p-6 w-full max-w-md">
          <Text className="text-maritime-white text-lg font-semibold text-center mb-4">
            {t("disclaimer.title")}
          </Text>

          <Text className="text-maritime-muted text-sm text-center leading-6 mb-6">
            {t("disclaimer.text")}
          </Text>

          <Button
            label={t("disclaimer.acknowledge")}
            onPress={acknowledge}
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}
