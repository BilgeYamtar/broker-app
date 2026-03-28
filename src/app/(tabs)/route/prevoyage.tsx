import { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Share } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import {
  calculatePreVoyage,
  PRE_VOYAGE_DEFAULTS,
  type PreVoyageResult,
} from "@/services/preVoyageService";

function fmt(value: number): string {
  return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function InputRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View className="flex-row gap-3">{children}</View>;
}

function ResultRow({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className={`text-sm ${bold ? "text-maritime-white font-bold" : "text-maritime-muted"}`}
      >
        {label}
      </Text>
      <Text
        className={`text-sm font-medium ${bold ? "text-lg font-bold" : ""}`}
        style={color ? { color } : undefined}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="border-b border-maritime-border" />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
      {label}
    </Text>
  );
}

function useField(initial: number): [string, (v: string) => void, number] {
  const [str, setStr] = useState(String(initial));
  const num = parseFloat(str) || 0;
  return [str, setStr, num];
}

export default function PreVoyageScreen() {
  const { t } = useI18n();
  const { distance, origin, destination } = useLocalSearchParams<{
    distance?: string;
    origin?: string;
    destination?: string;
  }>();

  const initialDistance = parseFloat(distance ?? "0") || 0;

  // Voyage
  const [distanceNm, setDistanceNm, distanceVal] = useField(initialDistance);
  const [speedKnots, setSpeedKnots, speedVal] = useField(PRE_VOYAGE_DEFAULTS.speedKnots);

  // Fuel
  const [dailyFuelSea, setDailyFuelSea, dailyFuelSeaVal] = useField(PRE_VOYAGE_DEFAULTS.dailyFuelAtSea);
  const [dailyFuelPort, setDailyFuelPort, dailyFuelPortVal] = useField(PRE_VOYAGE_DEFAULTS.dailyFuelInPort);
  const [priceIfo, setPriceIfo, priceIfoVal] = useField(PRE_VOYAGE_DEFAULTS.fuelPriceIfo);
  const [priceLsmgo, setPriceLsmgo, priceLsmgoVal] = useField(PRE_VOYAGE_DEFAULTS.fuelPriceLsmgo);
  const [portDays, setPortDays, portDaysVal] = useField(PRE_VOYAGE_DEFAULTS.portDays);
  const [ecaDist, setEcaDist, ecaDistVal] = useField(PRE_VOYAGE_DEFAULTS.ecaDistanceNm);

  // Charter
  const [charterRate, setCharterRate, charterRateVal] = useField(PRE_VOYAGE_DEFAULTS.charterRatePerDay);

  // Port costs
  const [loadCost, setLoadCost, loadCostVal] = useField(PRE_VOYAGE_DEFAULTS.loadingPortCosts);
  const [dischargeCost, setDischargeCost, dischargeCostVal] = useField(PRE_VOYAGE_DEFAULTS.dischargePortCosts);
  const [canalFees, setCanalFees, canalFeesVal] = useField(PRE_VOYAGE_DEFAULTS.canalFees);

  // Cargo & freight
  const [cargoQty, setCargoQty, cargoQtyVal] = useField(PRE_VOYAGE_DEFAULTS.cargoQuantity);
  const [freightRate, setFreightRate, freightRateVal] = useField(PRE_VOYAGE_DEFAULTS.freightRate);
  const [commission, setCommission, commissionVal] = useField(PRE_VOYAGE_DEFAULTS.brokerCommissionPct);

  // Insurance
  const [hmIns, setHmIns, hmInsVal] = useField(PRE_VOYAGE_DEFAULTS.hmInsurancePerDay);
  const [piIns, setPiIns, piInsVal] = useField(PRE_VOYAGE_DEFAULTS.piInsurancePerDay);

  // Real-time calculation
  const result: PreVoyageResult = useMemo(
    () =>
      calculatePreVoyage({
        distanceNm: distanceVal,
        speedKnots: speedVal,
        dailyFuelAtSea: dailyFuelSeaVal,
        dailyFuelInPort: dailyFuelPortVal,
        fuelPriceIfo: priceIfoVal,
        fuelPriceLsmgo: priceLsmgoVal,
        portDays: portDaysVal,
        ecaDistanceNm: ecaDistVal,
        charterRatePerDay: charterRateVal,
        loadingPortCosts: loadCostVal,
        dischargePortCosts: dischargeCostVal,
        canalFees: canalFeesVal,
        cargoQuantity: cargoQtyVal,
        freightRate: freightRateVal,
        brokerCommissionPct: commissionVal,
        hmInsurancePerDay: hmInsVal,
        piInsurancePerDay: piInsVal,
      }),
    [
      distanceVal, speedVal, dailyFuelSeaVal, dailyFuelPortVal,
      priceIfoVal, priceLsmgoVal, portDaysVal, ecaDistVal,
      charterRateVal, loadCostVal, dischargeCostVal, canalFeesVal,
      cargoQtyVal, freightRateVal, commissionVal, hmInsVal, piInsVal,
    ]
  );

  const profitColor = result.profitLoss >= 0 ? "#2dd4a8" : "#ef4444";

  const routeLabel = origin && destination ? `${origin} → ${destination}` : "";

  const handleShare = useCallback(async () => {
    const sep = "\u2500".repeat(32);
    const lines = [
      `\u2693 PRE-VOYAGE ${t("prevoyage.estimation").toUpperCase()}`,
      routeLabel ? `${t("prevoyage.route")}: ${routeLabel}` : "",
      `${t("route.distance")}: ${result.seaDays > 0 ? distanceVal.toLocaleString() : 0} NM`,
      `${t("prevoyage.seaDays")}: ${result.seaDays}`,
      `${t("prevoyage.portDays")}: ${portDaysVal}`,
      `${t("prevoyage.totalDays")}: ${result.totalDays}`,
      "",
      sep,
      `${t("prevoyage.fuelCosts").toUpperCase()}`,
      sep,
      `${t("prevoyage.seaFuelIfo")}: ${fmt(result.seaFuelCostIfo)}`,
      `${t("prevoyage.seaFuelLsmgo")}: ${fmt(result.seaFuelCostLsmgo)}`,
      `${t("prevoyage.portFuel")}: ${fmt(result.portFuelCost)}`,
      `${t("prevoyage.totalFuel")}: ${fmt(result.totalFuelCost)}`,
      "",
      sep,
      `${t("prevoyage.charterCosts").toUpperCase()}`,
      sep,
      `${t("prevoyage.totalCharter")}: ${fmt(result.totalCharterCost)}`,
      "",
      `${t("prevoyage.portCostsSection").toUpperCase()}`,
      sep,
      `${t("prevoyage.totalPortCosts")}: ${fmt(result.totalPortCosts)}`,
      "",
      `${t("prevoyage.insurance").toUpperCase()}`,
      sep,
      `${t("prevoyage.totalInsurance")}: ${fmt(result.totalInsurance)}`,
      "",
      sep,
      `${t("prevoyage.summary").toUpperCase()}`,
      sep,
      `${t("prevoyage.totalRevenue")}: ${fmt(result.netRevenue)}`,
      `${t("prevoyage.totalCosts")}: ${fmt(result.totalCosts)}`,
      `${t("prevoyage.profitLoss")}: ${fmt(result.profitLoss)} ${result.profitLoss >= 0 ? "\u2705" : "\u274C"}`,
      `${t("prevoyage.breakevenRate")}: $${result.breakevenFreightRate.toFixed(2)}/ton`,
      "",
      sep,
      `Y\u00FCk Portf\u00F6y\u00FC \u00B7 ${new Date().toLocaleDateString("tr-TR")}`,
    ];

    await Share.share({
      message: lines.filter((l) => l !== undefined).join("\n"),
      title: t("prevoyage.title"),
    });
  }, [result, distanceVal, portDaysVal, routeLabel, t]);

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header
            title={t("prevoyage.title")}
            subtitle={routeLabel || t("prevoyage.subtitle")}
            showBack
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Voyage Parameters */}
          <Card className="mb-4">
            <SectionLabel label={t("route.voyageParams")} />
            <InputRow>
              <View className="flex-1">
                <Input
                  label={t("route.distance") + " (NM)"}
                  value={distanceNm}
                  onChangeText={setDistanceNm}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("route.speed")}
                  value={speedKnots}
                  onChangeText={setSpeedKnots}
                  keyboardType="numeric"
                  placeholder="12"
                />
              </View>
            </InputRow>
            <ResultRow
              label={t("prevoyage.seaDays")}
              value={`${result.seaDays} ${t("prevoyage.days")}`}
            />
            <ResultRow
              label={t("prevoyage.totalDays")}
              value={`${result.totalDays} ${t("prevoyage.days")}`}
            />
          </Card>

          {/* Fuel Costs */}
          <Card className="mb-4">
            <SectionLabel label={t("prevoyage.fuelCosts")} />
            <InputRow>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.dailyFuelSea")}
                  value={dailyFuelSea}
                  onChangeText={setDailyFuelSea}
                  keyboardType="numeric"
                  placeholder="25"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.dailyFuelPort")}
                  value={dailyFuelPort}
                  onChangeText={setDailyFuelPort}
                  keyboardType="numeric"
                  placeholder="5"
                />
              </View>
            </InputRow>
            <InputRow>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.priceIfo")}
                  value={priceIfo}
                  onChangeText={setPriceIfo}
                  keyboardType="numeric"
                  placeholder="450"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.priceLsmgo")}
                  value={priceLsmgo}
                  onChangeText={setPriceLsmgo}
                  keyboardType="numeric"
                  placeholder="650"
                />
              </View>
            </InputRow>
            <InputRow>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.portDays")}
                  value={portDays}
                  onChangeText={setPortDays}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.ecaDistance")}
                  value={ecaDist}
                  onChangeText={setEcaDist}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </InputRow>

            <Divider />
            <ResultRow label={t("prevoyage.seaFuelIfo")} value={fmt(result.seaFuelCostIfo)} />
            <ResultRow label={t("prevoyage.seaFuelLsmgo")} value={fmt(result.seaFuelCostLsmgo)} />
            <ResultRow label={t("prevoyage.portFuel")} value={fmt(result.portFuelCost)} />
            <Divider />
            <ResultRow label={t("prevoyage.totalFuel")} value={fmt(result.totalFuelCost)} bold />
          </Card>

          {/* Charter / Hire */}
          <Card className="mb-4">
            <SectionLabel label={t("prevoyage.charterCosts")} />
            <Input
              label={t("route.charterRate")}
              value={charterRate}
              onChangeText={setCharterRate}
              keyboardType="numeric"
              placeholder="15000"
            />
            <Divider />
            <ResultRow label={t("prevoyage.totalCharter")} value={fmt(result.totalCharterCost)} bold />
          </Card>

          {/* Port Costs */}
          <Card className="mb-4">
            <SectionLabel label={t("prevoyage.portCostsSection")} />
            <InputRow>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.loadingCost")}
                  value={loadCost}
                  onChangeText={setLoadCost}
                  keyboardType="numeric"
                  placeholder="5000"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.dischargeCost")}
                  value={dischargeCost}
                  onChangeText={setDischargeCost}
                  keyboardType="numeric"
                  placeholder="5000"
                />
              </View>
            </InputRow>
            <Input
              label={t("prevoyage.canalFees")}
              value={canalFees}
              onChangeText={setCanalFees}
              keyboardType="numeric"
              placeholder="0"
            />
            <Divider />
            <ResultRow label={t("prevoyage.totalPortCosts")} value={fmt(result.totalPortCosts)} bold />
          </Card>

          {/* Cargo & Freight */}
          <Card className="mb-4">
            <SectionLabel label={t("prevoyage.cargoFreight")} />
            <InputRow>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.cargoQuantity")}
                  value={cargoQty}
                  onChangeText={setCargoQty}
                  keyboardType="numeric"
                  placeholder="10000"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.freightRate")}
                  value={freightRate}
                  onChangeText={setFreightRate}
                  keyboardType="numeric"
                  placeholder="15"
                />
              </View>
            </InputRow>
            <Input
              label={t("prevoyage.brokerCommission")}
              value={commission}
              onChangeText={setCommission}
              keyboardType="numeric"
              placeholder="2.5"
            />
            <Divider />
            <ResultRow label={t("prevoyage.freightRevenue")} value={fmt(result.freightRevenue)} />
            <ResultRow label={t("prevoyage.commissionAmount")} value={`-${fmt(result.commissionAmount)}`} />
            <ResultRow label={t("prevoyage.netRevenue")} value={fmt(result.netRevenue)} bold />
          </Card>

          {/* Insurance */}
          <Card className="mb-4">
            <SectionLabel label={t("prevoyage.insurance")} />
            <InputRow>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.hmInsurance")}
                  value={hmIns}
                  onChangeText={setHmIns}
                  keyboardType="numeric"
                  placeholder="500"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("prevoyage.piInsurance")}
                  value={piIns}
                  onChangeText={setPiIns}
                  keyboardType="numeric"
                  placeholder="300"
                />
              </View>
            </InputRow>
            <Divider />
            <ResultRow label={t("prevoyage.totalInsurance")} value={fmt(result.totalInsurance)} bold />
          </Card>

          {/* Summary */}
          <Card className="mb-4 border-2 border-maritime-teal">
            <SectionLabel label={t("prevoyage.summary")} />

            <ResultRow
              label={t("prevoyage.totalRevenue")}
              value={fmt(result.netRevenue)}
              bold
            />
            <Divider />

            <ResultRow label={t("prevoyage.fuelCosts")} value={fmt(result.totalFuelCost)} />
            <ResultRow label={t("prevoyage.charterCosts")} value={fmt(result.totalCharterCost)} />
            <ResultRow label={t("prevoyage.portCostsSection")} value={fmt(result.totalPortCosts)} />
            <ResultRow label={t("prevoyage.insurance")} value={fmt(result.totalInsurance)} />
            <Divider />
            <ResultRow
              label={t("prevoyage.totalCosts")}
              value={fmt(result.totalCosts)}
              bold
            />

            <View className="border-t-2 border-maritime-teal mt-3 pt-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-maritime-white text-base font-bold">
                  {t("prevoyage.profitLoss")}
                </Text>
                <Text
                  className="text-xl font-bold"
                  style={{ color: profitColor }}
                >
                  {fmt(result.profitLoss)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-maritime-muted text-xs">
                  {t("prevoyage.breakevenRate")}
                </Text>
                <Text className="text-maritime-white text-sm font-semibold">
                  ${result.breakevenFreightRate.toFixed(2)}/ton
                </Text>
              </View>
            </View>
          </Card>

          {/* Share Button */}
          <View className="mb-4">
            <Button
              label={t("prevoyage.share")}
              onPress={handleShare}
              variant="secondary"
              fullWidth
            />
          </View>

          {/* Disclaimer */}
          <View className="items-center py-4 mb-4">
            <Text className="text-maritime-muted text-xs text-center">
              {t("route.disclaimer")}
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
