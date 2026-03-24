import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n";
import type { BrokerNote } from "../brokerNoteSchemas";

interface BrokerNoteCardProps {
  note: BrokerNote;
  onPress: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BrokerNoteCard({ note, onPress }: BrokerNoteCardProps) {
  const { t } = useI18n();
  const attribution = note.captainName || note.sourceName;

  return (
    <Card onPress={onPress} className="mb-3">
      <Text
        className="text-maritime-white text-base leading-6"
        numberOfLines={3}
      >
        {note.noteText}
      </Text>

      <View className="flex-row items-center mt-3 gap-3">
        {attribution && (
          <Text className="text-maritime-teal text-xs font-medium" numberOfLines={1}>
            {note.captainName
              ? `${t("brokerNotes.captainName")}: ${note.captainName}`
              : `${t("brokerNotes.sourceName")}: ${note.sourceName}`}
          </Text>
        )}
        <Text className="text-maritime-muted text-xs ml-auto">
          {formatDate(note.updatedAt)}
        </Text>
      </View>

      {note.isDemo && (
        <View className="mt-2">
          <Badge label={t("common.demo")} variant="demo" />
        </View>
      )}
    </Card>
  );
}
