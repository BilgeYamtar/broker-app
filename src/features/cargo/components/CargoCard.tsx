import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n";
import type { Cargo } from "../cargoSchemas";

interface CargoCardProps {
  cargo: Cargo;
  onPress: () => void;
}

function getHazardBadgeVariant(
  hazardClass: string
): "default" | "warning" | "danger" {
  if (hazardClass === "Non-Hazardous") return "default";
  const classNum = parseInt(hazardClass.replace("Class ", ""), 10);
  if (classNum >= 1 && classNum <= 3) return "danger";
  return "warning";
}

export function CargoCard({ cargo, onPress }: CargoCardProps) {
  const { t } = useI18n();

  return (
    <Card onPress={onPress} className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-maritime-white text-base font-semibold" numberOfLines={1}>
            {cargo.cargoName}
          </Text>
          <Text className="text-maritime-muted text-sm mt-1">
            {cargo.cargoType}
          </Text>
        </View>
        <Badge
          label={cargo.hazardClass}
          variant={getHazardBadgeVariant(cargo.hazardClass)}
        />
      </View>

      <View className="flex-row items-center mt-3 gap-4">
        <View className="flex-row items-center">
          <Text className="text-maritime-muted text-xs">
            {t("cargo.weightMt")}:{" "}
          </Text>
          <Text className="text-maritime-white text-xs font-medium">
            {cargo.weightMt.toLocaleString()}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-maritime-muted text-xs">
            {t("cargo.volumeCbm")}:{" "}
          </Text>
          <Text className="text-maritime-white text-xs font-medium">
            {cargo.volumeCbm.toLocaleString()}
          </Text>
        </View>
        {(cargo.temperatureControl || cargo.ventilation) && (
          <View className="flex-row items-center gap-1 ml-auto">
            {cargo.temperatureControl && (
              <Badge label="TEMP" variant="warning" />
            )}
            {cargo.ventilation && (
              <Badge label="VENT" variant="default" />
            )}
          </View>
        )}
      </View>

      {cargo.isDemo && (
        <View className="mt-2">
          <Badge label={t("common.demo")} variant="demo" />
        </View>
      )}
    </Card>
  );
}
