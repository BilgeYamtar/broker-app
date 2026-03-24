import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Spinner } from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n";
import * as feasibilityRepository from "@/features/feasibility/feasibilityRepository";
import * as cargoRepository from "@/features/cargo/cargoRepository";
import * as vesselRepository from "@/features/vessel/vesselRepository";
import { FeasibilityResultCard } from "@/features/feasibility/components/FeasibilityResultCard";
import { ComplianceChecklist } from "@/features/feasibility/components/ComplianceChecklist";
import { AcknowledgmentGate } from "@/features/feasibility/components/AcknowledgmentGate";
import { DisclaimerFooter } from "@/features/feasibility/components/DisclaimerFooter";
import type { FeasibilityResult } from "@/features/feasibility/feasibilitySchemas";

interface PairContext {
  vesselName: string;
  vesselType: string;
  coatingType: string;
  cargoName: string;
  cargoType: string;
  hazardClass: string;
}

export default function FeasibilityResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const [result, setResult] = useState<FeasibilityResult | null>(null);
  const [context, setContext] = useState<PairContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await feasibilityRepository.getById(id);
      if (res.success) {
        setResult(res.data);

        // Load vessel & cargo names for context display
        const [vRes, cRes] = await Promise.all([
          vesselRepository.getVesselById(res.data.vesselId),
          cargoRepository.getCargoById(res.data.cargoId),
        ]);

        if (vRes.success && cRes.success) {
          setContext({
            vesselName: vRes.data.vesselName,
            vesselType: vRes.data.vesselType,
            coatingType: vRes.data.coatingType,
            cargoName: cRes.data.cargoName,
            cargoType: cRes.data.cargoType,
            hazardClass: cRes.data.hazardClass,
          });
        }
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <ErrorBoundary>
        <ScreenContainer>
          <Header title={t("feasibility.resultTitle")} showBack />
          <Spinner label={t("common.loading")} />
        </ScreenContainer>
      </ErrorBoundary>
    );
  }

  if (!result) {
    return (
      <ErrorBoundary>
        <ScreenContainer>
          <Header title={t("feasibility.resultTitle")} showBack />
          <View className="flex-1 items-center justify-center">
            <Text className="text-maritime-muted text-sm">
              {t("errors.loadFailed")}
            </Text>
          </View>
        </ScreenContainer>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <Header title={t("feasibility.resultTitle")} showBack />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        >
          {/* Vessel ↔ Cargo Context */}
          {context && (
            <Card className="mb-4">
              <View className="flex-row items-center">
                {/* Vessel side */}
                <View className="flex-1">
                  <Text className="text-maritime-muted text-xs uppercase tracking-wide">
                    {t("feasibility.selectVessel")}
                  </Text>
                  <Text
                    className="text-maritime-white text-sm font-semibold mt-1"
                    numberOfLines={1}
                  >
                    {context.vesselName}
                  </Text>
                  <Text className="text-maritime-muted text-xs mt-0.5">
                    {context.vesselType} · {context.coatingType}
                  </Text>
                </View>

                {/* Divider */}
                <View className="mx-3 items-center">
                  <Text className="text-maritime-teal text-lg font-bold">
                    ↔
                  </Text>
                </View>

                {/* Cargo side */}
                <View className="flex-1 items-end">
                  <Text className="text-maritime-muted text-xs uppercase tracking-wide">
                    {t("feasibility.selectCargo")}
                  </Text>
                  <Text
                    className="text-maritime-white text-sm font-semibold mt-1"
                    numberOfLines={1}
                  >
                    {context.cargoName}
                  </Text>
                  <Text className="text-maritime-muted text-xs mt-0.5">
                    {context.cargoType} · {context.hazardClass}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Demo badge */}
          {result.isDemo && (
            <View className="mb-4 items-center">
              <Badge label={t("common.demo")} variant="demo" />
            </View>
          )}

          {/* Overall Score + FTS */}
          <FeasibilityResultCard
            overallScore={result.overallScore}
            ftsStatus={result.ftsStatus}
          />

          {/* Compliance Breakdown + Flag Details */}
          <ComplianceChecklist
            hullIntegrityScore={result.hullIntegrityScore}
            thermalScore={result.thermalScore}
            ecaComplianceScore={result.ecaComplianceScore}
            flags={result.flags}
            flagDetails={result.flagDetails}
          />

          {/* Disclaimer — always visible (FR34) */}
          <DisclaimerFooter />
        </ScrollView>

        {/* Acknowledgment Gate — first time only */}
        <AcknowledgmentGate />
      </ScreenContainer>
    </ErrorBoundary>
  );
}
