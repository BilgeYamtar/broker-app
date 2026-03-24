import { useEffect, useState, useCallback } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { useCargoStore } from "@/features/cargo/useCargoStore";
import { useVesselStore } from "@/features/vessel/useVesselStore";
import { useFeasibilityStore } from "@/features/feasibility/useFeasibilityStore";
import { CargoVesselSelector } from "@/features/feasibility/components/CargoVesselSelector";
import { runFeasibility } from "@/services/feasibilityService";
import type { FeasibilityRule } from "@/services/feasibilityService";
import rules from "@/data/feasibilityRules.json";

const typedRules = rules as FeasibilityRule[];

export default function FeasibilityScreen() {
  const { t } = useI18n();
  const router = useRouter();

  const cargoes = useCargoStore((s) => s.cargoes);
  const loadCargoes = useCargoStore((s) => s.loadCargoes);
  const vessels = useVesselStore((s) => s.vessels);
  const loadVessels = useVesselStore((s) => s.loadVessels);
  const saveResult = useFeasibilityStore((s) => s.saveResult);

  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadCargoes();
    loadVessels();
  }, []);

  const canRun = selectedCargoId !== null && selectedVesselId !== null && !running;

  const handleRun = useCallback(async () => {
    if (!selectedCargoId || !selectedVesselId) return;

    const cargo = cargoes.find((c) => c.id === selectedCargoId);
    const vessel = vessels.find((v) => v.id === selectedVesselId);
    if (!cargo || !vessel) {
      Alert.alert(t("common.error"), t("errors.loadFailed"));
      return;
    }

    setRunning(true);

    // 1. Run pure feasibility engine
    const engineResult = runFeasibility(
      {
        id: cargo.id,
        cargoType: cargo.cargoType,
        hazardClass: cargo.hazardClass,
        temperatureControl: cargo.temperatureControl,
      },
      {
        id: vessel.id,
        vesselType: vessel.vesselType,
        coatingType: vessel.coatingType,
        builtYear: vessel.builtYear,
        dwtCapacity: vessel.dwtCapacity,
      },
      typedRules
    );

    if (!engineResult.success) {
      setRunning(false);
      Alert.alert(t("common.error"), engineResult.error);
      return;
    }

    // 2. Persist to SQLite
    const saveRes = await saveResult({
      ...engineResult.data,
      isDemo: false,
    });

    setRunning(false);

    if (!saveRes.success) {
      Alert.alert(t("common.error"), t("errors.saveFailed"));
      return;
    }

    // 3. Navigate to result screen
    router.push(`/feasibility/result?id=${saveRes.data.id}`);
  }, [selectedCargoId, selectedVesselId, cargoes, vessels, saveResult, router, t]);

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header
          title={t("feasibility.title")}
          subtitle={t("feasibility.subtitle")}
        />

        <View className="px-4 pt-4 flex-1">
          <CargoVesselSelector
            cargoes={cargoes}
            vessels={vessels}
            selectedCargoId={selectedCargoId}
            selectedVesselId={selectedVesselId}
            onCargoSelect={setSelectedCargoId}
            onVesselSelect={setSelectedVesselId}
          />

          {!canRun && !running && (
            <View className="items-center py-6">
              <Text className="text-maritime-muted text-sm text-center">
                {t("feasibility.readyToAnalyzeDesc")}
              </Text>
            </View>
          )}

          <View className="mt-auto mb-8">
            <Button
              label={t("feasibility.runAnalysis")}
              onPress={handleRun}
              variant="primary"
              disabled={!canRun}
              loading={running}
              fullWidth
            />
          </View>
        </View>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
