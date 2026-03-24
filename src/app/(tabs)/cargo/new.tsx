import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { useI18n } from "@/lib/i18n";
import { CargoForm } from "@/features/cargo/components/CargoForm";

export default function NewCargoScreen() {
  const { t } = useI18n();

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header title={t("cargo.newCargoTitle")} showBack />
        <CargoForm />
      </ScreenContainer>
    </ErrorBoundary>
  );
}
