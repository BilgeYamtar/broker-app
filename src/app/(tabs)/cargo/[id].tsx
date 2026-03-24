import { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { useCargoStore } from "@/features/cargo/useCargoStore";
import { CargoForm } from "@/features/cargo/components/CargoForm";
import * as cargoRepository from "@/features/cargo/cargoRepository";
import type { CargoFormData } from "@/features/cargo/cargoSchemas";

export default function CargoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const deleteCargoAction = useCargoStore((s) => s.deleteCargo);

  const [initialData, setInitialData] = useState<CargoFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const result = await cargoRepository.getCargoById(id);
      if (result.success) {
        const c = result.data;
        setInitialData({
          cargoName: c.cargoName,
          cargoType: c.cargoType,
          weightMt: c.weightMt,
          volumeCbm: c.volumeCbm,
          hazardClass: c.hazardClass,
          temperatureControl: c.temperatureControl,
          ventilation: c.ventilation,
        });
      } else {
        Alert.alert(t("common.error"), t("errors.loadFailed"));
        router.back();
      }
      setLoading(false);
    })();
  }, [id]);

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
            if (!id) return;
            const result = await deleteCargoAction(id);
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
          <Header title={t("cargo.editCargoTitle")} showBack />
          <Spinner label={t("common.loading")} />
        </ScreenContainer>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header title={t("cargo.editCargoTitle")} showBack />
        {initialData && (
          <CargoForm initialData={initialData} cargoId={id} />
        )}
        <View className="px-4 mb-8">
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
