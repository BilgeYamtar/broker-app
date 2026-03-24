import { useEffect, useCallback } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useI18n } from "@/lib/i18n";
import { useBrokerNoteStore } from "../useBrokerNoteStore";
import { BrokerNoteCard } from "./BrokerNoteCard";
import type { BrokerNote } from "../brokerNoteSchemas";

interface BrokerNoteListProps {
  vesselId: string;
}

export function BrokerNoteList({ vesselId }: BrokerNoteListProps) {
  const { t } = useI18n();
  const router = useRouter();
  const notes = useBrokerNoteStore((s) => s.notes);
  const isLoading = useBrokerNoteStore((s) => s.isLoading);
  const loadByVesselId = useBrokerNoteStore((s) => s.loadByVesselId);

  useEffect(() => {
    loadByVesselId(vesselId);
  }, [vesselId]);

  const renderItem = useCallback(
    ({ item }: { item: BrokerNote }) => (
      <BrokerNoteCard
        note={item}
        onPress={() => router.push(`/vessels/notes/${item.id}`)}
      />
    ),
    [router]
  );

  const keyExtractor = useCallback((item: BrokerNote) => item.id, []);

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-maritime-white text-lg font-semibold">
          {t("brokerNotes.title")}
        </Text>
        <Button
          label={t("brokerNotes.addNote")}
          onPress={() => router.push(`/vessels/notes/new?vesselId=${vesselId}`)}
          variant="secondary"
        />
      </View>

      {isLoading ? (
        <Spinner label={t("common.loading")} />
      ) : notes.length === 0 ? (
        <View className="items-center py-8">
          <Text className="text-maritime-muted text-sm">
            {t("brokerNotes.noNotes")}
          </Text>
        </View>
      ) : (
        <FlashList
          data={notes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}
