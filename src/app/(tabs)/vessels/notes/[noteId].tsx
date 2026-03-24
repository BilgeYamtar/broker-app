import { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { useBrokerNoteStore } from "@/features/broker-notes/useBrokerNoteStore";
import { BrokerNoteForm } from "@/features/broker-notes/components/BrokerNoteForm";
import { NotePhotoStrip } from "@/features/photos/components/NotePhotoStrip";
import * as brokerNoteRepository from "@/features/broker-notes/brokerNoteRepository";
import type { BrokerNoteFormData } from "@/features/broker-notes/brokerNoteSchemas";

export default function BrokerNoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const deleteNoteAction = useBrokerNoteStore((s) => s.deleteNote);

  const [initialData, setInitialData] = useState<BrokerNoteFormData | null>(
    null
  );
  const [vesselId, setVesselId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!noteId) return;
    (async () => {
      const result = await brokerNoteRepository.getBrokerNoteById(noteId);
      if (result.success) {
        const n = result.data;
        setVesselId(n.vesselId);
        setInitialData({
          vesselId: n.vesselId,
          noteText: n.noteText,
          captainName: n.captainName ?? undefined,
          sourceName: n.sourceName ?? undefined,
        });
      } else {
        Alert.alert(t("common.error"), t("errors.loadFailed"));
        router.back();
      }
      setLoading(false);
    })();
  }, [noteId]);

  const handleDelete = () => {
    Alert.alert(
      t("common.deleteConfirmTitle"),
      t("common.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            if (!noteId) return;
            const result = await deleteNoteAction(noteId);
            if (result.success) {
              router.back();
            } else {
              Alert.alert(t("common.error"), t("errors.deleteFailed"));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <ScreenContainer>
          <Header title={t("brokerNotes.editNoteTitle")} showBack />
          <Spinner label={t("common.loading")} />
        </ScreenContainer>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header title={t("brokerNotes.editNoteTitle")} showBack />
        {initialData && vesselId && (
          <BrokerNoteForm
            vesselId={vesselId}
            initialData={initialData}
            noteId={noteId}
          />
        )}
        {noteId && (
          <View className="px-4">
            <NotePhotoStrip brokerNoteId={noteId} />
          </View>
        )}
        <View className="px-4 mb-8 mt-6">
          <Button
            label={t("common.delete")}
            onPress={handleDelete}
            variant="danger"
            fullWidth
          />
        </View>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
