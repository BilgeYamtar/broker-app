import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Spinner } from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import * as feasibilityRepository from "@/features/feasibility/feasibilityRepository";
import * as cargoRepository from "@/features/cargo/cargoRepository";
import * as vesselRepository from "@/features/vessel/vesselRepository";
import { FeasibilityResultCard } from "@/features/feasibility/components/FeasibilityResultCard";
import { ComplianceChecklist } from "@/features/feasibility/components/ComplianceChecklist";
import { AcknowledgmentGate } from "@/features/feasibility/components/AcknowledgmentGate";
import { DisclaimerFooter } from "@/features/feasibility/components/DisclaimerFooter";
import { shareReportAsPdf, shareReportAsText, type ReportData } from "@/services/reportExportService";
import type { FeasibilityResult } from "@/features/feasibility/feasibilitySchemas";
import type { Vessel } from "@/features/vessel/vesselSchemas";
import type { Cargo } from "@/features/cargo/cargoSchemas";

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
  const [vesselData, setVesselData] = useState<Vessel | null>(null);
  const [cargoData, setCargoData] = useState<Cargo | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingText, setExportingText] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await feasibilityRepository.getById(id);
        if (!res.success) {
          setLoading(false);
          return;
        }

        setResult(res.data);

        // Load vessel & cargo for context display + PDF export
        // Wrapped separately so a failure here doesn't break the result screen
        try {
          const [vRes, cRes] = await Promise.all([
            vesselRepository.getVesselById(res.data.vesselId),
            cargoRepository.getCargoById(res.data.cargoId),
          ]);

          if (vRes.success) setVesselData(vRes.data);
          if (cRes.success) setCargoData(cRes.data);

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
        } catch {
          // Vessel/cargo lookup failed — result screen still works without context
        }
      } catch {
        // Feasibility result lookup failed — will show error state
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const buildReportData = useCallback((): ReportData | null => {
    if (!result || !vesselData || !cargoData) return null;
    return {
      result,
      vessel: {
        vesselName: vesselData.vesselName,
        imoNumber: vesselData.imoNumber,
        vesselType: vesselData.vesselType,
        coatingType: vesselData.coatingType,
        flag: vesselData.flag,
        dwtCapacity: vesselData.dwtCapacity,
      },
      cargo: {
        cargoName: cargoData.cargoName,
        cargoType: cargoData.cargoType,
        weightMt: cargoData.weightMt,
        hazardClass: cargoData.hazardClass,
        temperatureControl: cargoData.temperatureControl,
      },
      labels: {
        reportTitle: t("feasibility.reportTitle"),
        dateLabel: t("feasibility.exportDate"),
        reportIdLabel: t("feasibility.exportReportId"),
        vesselLabel: t("feasibility.selectVessel"),
        cargoLabel: t("feasibility.selectCargo"),
        vesselNameLabel: t("vessels.vesselName"),
        imoLabel: t("vessels.imoNumber"),
        vesselTypeLabel: t("vessels.vesselType"),
        coatingLabel: t("vessels.coatingType"),
        flagLabel: t("vessels.flag"),
        dwtLabel: t("vessels.dwtCapacity"),
        cargoNameLabel: t("cargo.cargoName"),
        cargoTypeLabel: t("cargo.cargoType"),
        weightLabel: t("cargo.weightMt"),
        hazardLabel: t("cargo.hazardClass"),
        tempControlLabel: t("cargo.temperatureControl"),
        overallScoreLabel: t("feasibility.overallScore"),
        ftsLabel: t("feasibility.fitToShip"),
        notFtsLabel: t("feasibility.notFitToShip"),
        complianceLabel: t("feasibility.complianceBreakdown"),
        hullLabel: t("feasibility.hullIntegrity"),
        thermalLabel: t("feasibility.thermalManagement"),
        ecaLabel: t("feasibility.ecaCompliance"),
        findingsLabel: t("feasibility.detailedFindings"),
        disclaimerText: t("disclaimer.text"),
        yesLabel: t("common.yes"),
        noLabel: t("common.no"),
      },
    };
  }, [result, vesselData, cargoData, t]);

  const handleExportPdf = useCallback(async () => {
    const data = buildReportData();
    if (!data) {
      Alert.alert(t("common.error"), t("feasibility.exportFailed"));
      return;
    }
    setExportingPdf(true);
    try {
      await shareReportAsPdf(data);
    } catch {
      Alert.alert(t("common.error"), t("feasibility.exportFailed"));
    } finally {
      setExportingPdf(false);
    }
  }, [buildReportData, t]);

  const handleExportText = useCallback(async () => {
    const data = buildReportData();
    if (!data) {
      Alert.alert(t("common.error"), t("feasibility.exportFailed"));
      return;
    }
    setExportingText(true);
    try {
      await shareReportAsText(data);
    } catch {
      Alert.alert(t("common.error"), t("feasibility.exportFailed"));
    } finally {
      setExportingText(false);
    }
  }, [buildReportData, t]);

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

          {/* Export actions */}
          <View className="mb-4 mt-2">
            <Button
              label={t("feasibility.exportPdf")}
              onPress={handleExportPdf}
              variant="primary"
              disabled={!vesselData || !cargoData}
              loading={exportingPdf}
              fullWidth
            />
          </View>
          <View className="mb-8">
            <Button
              label={t("feasibility.exportText")}
              onPress={handleExportText}
              variant="ghost"
              disabled={!vesselData || !cargoData}
              loading={exportingText}
              fullWidth
            />
          </View>
        </ScrollView>

        {/* Acknowledgment Gate — first time only */}
        <AcknowledgmentGate />
      </ScreenContainer>
    </ErrorBoundary>
  );
}
