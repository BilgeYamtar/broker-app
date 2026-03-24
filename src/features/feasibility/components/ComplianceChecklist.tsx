import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/constants/colors";
import type { Flags, FlagDetail } from "../feasibilitySchemas";

interface ComplianceChecklistProps {
  hullIntegrityScore: number;
  thermalScore: number;
  ecaComplianceScore: number;
  flags: Flags;
  flagDetails: FlagDetail[];
}

const FLAG_COLOR_MAP = {
  green: colors.flag.green,
  yellow: colors.flag.yellow,
  red: colors.flag.red,
} as const;

const FLAG_LABEL_MAP = {
  green: "OK",
  yellow: "WARN",
  red: "FAIL",
} as const;

// ── Score Row ───────────────────────────────────────────────────────────────

function ScoreRow({
  label,
  score,
  flagColor,
}: {
  label: string;
  score: number;
  flagColor: "green" | "yellow" | "red";
}) {
  const color = FLAG_COLOR_MAP[flagColor];
  const statusLabel = FLAG_LABEL_MAP[flagColor];

  return (
    <View className="flex-row items-center py-3">
      {/* Color indicator bar */}
      <View
        style={{
          width: 4,
          height: 36,
          borderRadius: 2,
          backgroundColor: color,
          marginRight: 12,
        }}
      />

      <View className="flex-1">
        <Text className="text-maritime-white text-sm font-medium">
          {label}
        </Text>
      </View>

      {/* Score */}
      <Text
        className="text-lg font-bold mr-3"
        style={{ color, minWidth: 32, textAlign: "right" }}
      >
        {score}
      </Text>

      {/* Status pill */}
      <View
        className="rounded-md px-2.5 py-1"
        style={{
          backgroundColor: `${color}18`,
          borderWidth: 1,
          borderColor: color,
          minWidth: 52,
          alignItems: "center",
        }}
      >
        <Text
          className="text-2xs font-bold uppercase"
          style={{ color }}
        >
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

// ── Flag Detail Item ────────────────────────────────────────────────────────

function FlagDetailItem({
  detail,
  isFirst,
}: {
  detail: FlagDetail;
  isFirst: boolean;
}) {
  const dotColor = FLAG_COLOR_MAP[detail.color];

  return (
    <View
      className={`flex-row items-start ${!isFirst ? "mt-3 pt-3 border-t border-maritime-border" : ""}`}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: dotColor,
          marginTop: 5,
          marginRight: 10,
        }}
      />
      <View className="flex-1">
        <Text className="text-maritime-muted text-xs uppercase tracking-wide">
          {detail.dimension}
        </Text>
        <Text className="text-maritime-white text-sm mt-1 leading-5">
          {detail.message}
        </Text>
      </View>
    </View>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function ComplianceChecklist({
  hullIntegrityScore,
  thermalScore,
  ecaComplianceScore,
  flags,
  flagDetails,
}: ComplianceChecklistProps) {
  const { t } = useI18n();

  return (
    <>
      {/* Dimension Scores */}
      <Card className="mb-4">
        <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-2">
          {t("feasibility.complianceBreakdown")}
        </Text>

        <ScoreRow
          label={t("feasibility.hullIntegrity")}
          score={hullIntegrityScore}
          flagColor={flags.hullIntegrity}
        />
        <View className="border-b border-maritime-border" />
        <ScoreRow
          label={t("feasibility.thermalManagement")}
          score={thermalScore}
          flagColor={flags.thermal}
        />
        <View className="border-b border-maritime-border" />
        <ScoreRow
          label={t("feasibility.ecaCompliance")}
          score={ecaComplianceScore}
          flagColor={flags.ecaCompliance}
        />
      </Card>

      {/* Flag Details */}
      {flagDetails.length > 0 && (
        <Card className="mb-4">
          <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
            {t("feasibility.detailedFindings")}
          </Text>
          {flagDetails.map((detail, index) => (
            <FlagDetailItem
              key={index}
              detail={detail}
              isFirst={index === 0}
            />
          ))}
        </Card>
      )}
    </>
  );
}
