import { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { useVesselStore } from "@/features/vessel/useVesselStore";
import { VesselForm } from "@/features/vessel/components/VesselForm";
import { VesselPhotoHeader } from "@/features/photos/components/VesselPhotoHeader";
import { BrokerNoteList } from "@/features/broker-notes/components/BrokerNoteList";
import { VesselPhotoGrid } from "@/features/photos/components/VesselPhotoGrid";
import * as vesselRepository from "@/features/vessel/vesselRepository";
import type { VesselFormData } from "@/features/vessel/vesselSchemas";

export default function VesselDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const deleteVesselAction = useVesselStore((s) => s.deleteVessel);

  const [initialData, setInitialData] = useState<VesselFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const result = await vesselRepository.getVesselById(id);
      if (result.success) {
        const v = result.data;
        setInitialData({
          vesselName: v.vesselName,
          imoNumber: v.imoNumber,
          builtYear: v.builtYear,
          dwtCapacity: v.dwtCapacity,
          lengthM: v.lengthM,
          beamM: v.beamM,
          depthM: v.depthM,
          grossTonnage: v.grossTonnage,
          netTonnage: v.netTonnage,
          classificationSociety: v.classificationSociety,
          piClub: v.piClub,
          vesselType: v.vesselType,
          coatingType: v.coatingType,
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
            const result = await deleteVesselAction(id);
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
          <Header title={t("vessels.editVesselTitle")} showBack />
          <Spinner label={t("common.loading")} />
        </ScreenContainer>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header title={t("vessels.editVesselTitle")} showBack />
        {id && (
          <View className="px-4 mt-2">
            <VesselPhotoHeader vesselId={id} />
          </View>
        )}
        {initialData && (
          <VesselForm initialData={initialData} vesselId={id} />
        )}
        {id && (
          <View className="px-4">
            <BrokerNoteList vesselId={id} />
          </View>
        )}
        {id && (
          <View className="px-4">
            <VesselPhotoGrid vesselId={id} />
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
