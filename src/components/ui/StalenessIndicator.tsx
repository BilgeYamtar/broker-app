import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n";
import { isStale } from "@/lib/dateUtils";

interface StalenessIndicatorProps {
  updatedAt: string;
}

export function StalenessIndicator({ updatedAt }: StalenessIndicatorProps) {
  const { t } = useI18n();

  if (!isStale(updatedAt)) return null;

  return <Badge label={t("common.dataOutdated")} variant="warning" />;
}
