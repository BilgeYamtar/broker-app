import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/constants/colors";

interface FeasibilityResultCardProps {
  overallScore: number;
  ftsStatus: "FTS" | "NOT_FTS";
}

function scoreColor(score: number): string {
  if (score >= 75) return colors.flag.green;
  if (score >= 50) return colors.flag.yellow;
  return colors.flag.red;
}

export function FeasibilityResultCard({
  overallScore,
  ftsStatus,
}: FeasibilityResultCardProps) {
  const { t } = useI18n();
  const isFts = ftsStatus === "FTS";
  const ringColor = scoreColor(overallScore);

  return (
    <Card className="mb-4 items-center py-8">
      {/* Score Ring */}
      <View
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          borderWidth: 6,
          borderColor: ringColor,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${ringColor}10`,
        }}
      >
        <Text
          style={{ color: ringColor, fontSize: 48, fontWeight: "800" }}
        >
          {overallScore}
        </Text>
      </View>

      <Text className="text-maritime-muted text-xs uppercase tracking-widest mt-4">
        {t("feasibility.overallScore")}
      </Text>

      {/* FTS Determination */}
      <View
        className="mt-4 rounded-lg px-6 py-3"
        style={{
          backgroundColor: isFts ? `${colors.flag.green}15` : `${colors.flag.red}15`,
          borderWidth: 1,
          borderColor: isFts ? colors.flag.green : colors.flag.red,
        }}
      >
        <Text
          className="text-base font-bold uppercase tracking-wide text-center"
          style={{ color: isFts ? colors.flag.green : colors.flag.red }}
        >
          {isFts ? t("feasibility.fitToShip") : t("feasibility.notFitToShip")}
        </Text>
      </View>
    </Card>
  );
}
