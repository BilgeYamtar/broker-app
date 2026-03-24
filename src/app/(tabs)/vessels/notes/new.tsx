import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { useI18n } from "@/lib/i18n";
import { useLocalSearchParams } from "expo-router";
import { BrokerNoteForm } from "@/features/broker-notes/components/BrokerNoteForm";

export default function NewBrokerNoteScreen() {
  const { t } = useI18n();
  const { vesselId } = useLocalSearchParams<{ vesselId: string }>();

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header title={t("brokerNotes.newNoteTitle")} showBack />
        {vesselId && <BrokerNoteForm vesselId={vesselId} />}
      </ScreenContainer>
    </ErrorBoundary>
  );
}
