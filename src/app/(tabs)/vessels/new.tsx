import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { useI18n } from "@/lib/i18n";
import { VesselForm } from "@/features/vessel/components/VesselForm";

export default function NewVesselScreen() {
  const { t } = useI18n();

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header title={t("vessels.newVesselTitle")} showBack />
        <VesselForm />
      </ScreenContainer>
    </ErrorBoundary>
  );
}
