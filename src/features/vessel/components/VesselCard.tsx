import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StalenessIndicator } from "@/components/ui/StalenessIndicator";
import { useI18n } from "@/lib/i18n";
import { coastalNations } from "@/data/coastalNations";
import type { Vessel } from "../vesselSchemas";

interface VesselCardProps {
  vessel: Vessel;
  onPress: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function VesselCard({ vessel, onPress }: VesselCardProps) {
  const { t } = useI18n();

  return (
    <Card onPress={onPress} className="mb-3">
      {/* Row 1: Name + Status badge */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text
            className="text-maritime-white text-base font-semibold"
            numberOfLines={1}
          >
            {vessel.flag
              ? `${coastalNations.find((n) => n.code === vessel.flag)?.flag ?? ""} `
              : ""}
            {vessel.vesselName}
          </Text>
          <Text className="text-maritime-muted text-sm mt-1">
            IMO {vessel.imoNumber}
          </Text>
        </View>
        <Badge
          label={vessel.isActive ? t("vessels.active") : t("vessels.inactive")}
          variant={vessel.isActive ? "success" : "default"}
        />
      </View>

      {/* Row 2: Type + DWT */}
      <View className="flex-row items-center mt-3 gap-4">
        <View className="flex-row items-center">
          <Text className="text-maritime-muted text-xs">
            {t("vessels.vesselType")}:{" "}
          </Text>
          <Text className="text-maritime-white text-xs font-medium">
            {vessel.vesselType}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-maritime-muted text-xs">DWT: </Text>
          <Text className="text-maritime-white text-xs font-medium">
            {vessel.dwtCapacity.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Row 3: Last updated + staleness + demo badge */}
      <View className="flex-row items-center mt-2 justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-maritime-muted text-2xs">
            {t("vessels.lastUpdated")}: {formatDate(vessel.updatedAt)}
          </Text>
          <StalenessIndicator updatedAt={vessel.updatedAt} />
        </View>
        {vessel.isDemo && <Badge label={t("common.demo")} variant="demo" />}
      </View>
    </Card>
  );
}
