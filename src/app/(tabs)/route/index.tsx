import { useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter, type RelativePathString } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { PortPicker } from "@/features/route/components/PortPicker";
import { calculateRoute, type Port } from "@/services/portService";
import {
  calculateVoyageCost,
  VOYAGE_DEFAULTS,
  type VoyageCostResult,
} from "@/services/voyageCostService";

function formatCurrency(value: number): string {
  return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatDuration(hours: number): string {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (days === 0) return `${remainingHours}h`;
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours}h`;
}

export default function RoutePlanningScreen() {
  const { t } = useI18n();
  const router = useRouter();

  const [originPort, setOriginPort] = useState<Port | null>(null);
  const [destinationPort, setDestinationPort] = useState<Port | null>(null);

  // Editable voyage parameters
  const [speedKnots, setSpeedKnots] = useState(String(VOYAGE_DEFAULTS.speedKnots));
  const [dailyFuelTons, setDailyFuelTons] = useState(String(VOYAGE_DEFAULTS.dailyFuelTons));
  const [fuelPricePerTon, setFuelPricePerTon] = useState(String(VOYAGE_DEFAULTS.fuelPricePerTon));
  const [charterRatePerDay, setCharterRatePerDay] = useState(String(VOYAGE_DEFAULTS.charterRatePerDay));
  const [portCosts, setPortCosts] = useState(String(VOYAGE_DEFAULTS.portCosts));

  const [result, setResult] = useState<VoyageCostResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const canCalculate = originPort !== null && destinationPort !== null && !calculating;

  const handleCalculate = useCallback(() => {
    if (!originPort || !destinationPort) return;

    setCalculating(true);

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const routeResult = calculateRoute(originPort, destinationPort);

      const voyageResult = calculateVoyageCost({
        distanceNm: routeResult.distanceNm,
        speedKnots: parseFloat(speedKnots) || VOYAGE_DEFAULTS.speedKnots,
        dailyFuelTons: parseFloat(dailyFuelTons) || VOYAGE_DEFAULTS.dailyFuelTons,
        fuelPricePerTon: parseFloat(fuelPricePerTon) || VOYAGE_DEFAULTS.fuelPricePerTon,
        charterRatePerDay: parseFloat(charterRatePerDay) || VOYAGE_DEFAULTS.charterRatePerDay,
        portCosts: parseFloat(portCosts) || VOYAGE_DEFAULTS.portCosts,
      });

      setResult(voyageResult);
      setCalculating(false);
    }, 50);
  }, [originPort, destinationPort, speedKnots, dailyFuelTons, fuelPricePerTon, charterRatePerDay, portCosts]);

  const handleSwapPorts = () => {
    const temp = originPort;
    setOriginPort(destinationPort);
    setDestinationPort(temp);
    setResult(null);
  };

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header
            title={t("route.title")}
            subtitle={t("route.subtitle")}
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Port Selection */}
          <Card className="mb-4">
            <PortPicker
              label={t("route.origin")}
              selectedPort={originPort}
              onSelect={(p) => { setOriginPort(p); setResult(null); }}
            />

            {/* Swap button */}
            <View className="items-center -my-2 mb-2">
              <Button
                label="⇅"
                onPress={handleSwapPorts}
                variant="ghost"
              />
            </View>

            <PortPicker
              label={t("route.destination")}
              selectedPort={destinationPort}
              onSelect={(p) => { setDestinationPort(p); setResult(null); }}
            />
          </Card>

          {/* Voyage Parameters */}
          <Card className="mb-4">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              {t("route.voyageParams")}
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label={t("route.speed")}
                  value={speedKnots}
                  onChangeText={(v) => { setSpeedKnots(v); setResult(null); }}
                  keyboardType="numeric"
                  placeholder="12"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("route.dailyFuel")}
                  value={dailyFuelTons}
                  onChangeText={(v) => { setDailyFuelTons(v); setResult(null); }}
                  keyboardType="numeric"
                  placeholder="25"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label={t("route.fuelPrice")}
                  value={fuelPricePerTon}
                  onChangeText={(v) => { setFuelPricePerTon(v); setResult(null); }}
                  keyboardType="numeric"
                  placeholder="650"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("route.charterRate")}
                  value={charterRatePerDay}
                  onChangeText={(v) => { setCharterRatePerDay(v); setResult(null); }}
                  keyboardType="numeric"
                  placeholder="15000"
                />
              </View>
            </View>

            <Input
              label={t("route.portCosts")}
              value={portCosts}
              onChangeText={(v) => { setPortCosts(v); setResult(null); }}
              keyboardType="numeric"
              placeholder="5000"
            />
          </Card>

          {/* Calculate Button */}
          <View className="mb-4">
            <Button
              label={t("route.calculate")}
              onPress={handleCalculate}
              variant="primary"
              disabled={!canCalculate}
              loading={calculating}
              fullWidth
            />
          </View>

          {/* Results */}
          {result && (
            <>
              {/* Distance & Duration */}
              <Card className="mb-4">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                  {t("route.routeInfo")}
                </Text>

                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-maritime-muted text-sm">
                    {t("route.distance")}
                  </Text>
                  <Text className="text-maritime-white text-lg font-bold">
                    {result.distanceNm.toLocaleString()} NM
                  </Text>
                </View>

                <View className="border-b border-maritime-border" />

                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-maritime-muted text-sm">
                    {t("route.duration")}
                  </Text>
                  <Text className="text-maritime-white text-lg font-bold">
                    {formatDuration(result.durationHours)}
                  </Text>
                </View>

                <View className="border-b border-maritime-border" />

                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-maritime-muted text-sm">
                    {t("route.fuelConsumption")}
                  </Text>
                  <Text className="text-maritime-white text-lg font-bold">
                    {result.fuelConsumptionTons.toLocaleString()} t
                  </Text>
                </View>
              </Card>

              {/* Cost Breakdown */}
              <Card className="mb-4">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                  {t("route.costBreakdown")}
                </Text>

                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-maritime-muted text-sm">
                    {t("route.fuelCost")}
                  </Text>
                  <Text className="text-maritime-white text-sm font-medium">
                    {formatCurrency(result.fuelCost)}
                  </Text>
                </View>

                <View className="border-b border-maritime-border" />

                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-maritime-muted text-sm">
                    {t("route.charterCostLabel")}
                  </Text>
                  <Text className="text-maritime-white text-sm font-medium">
                    {formatCurrency(result.charterCost)}
                  </Text>
                </View>

                <View className="border-b border-maritime-border" />

                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-maritime-muted text-sm">
                    {t("route.portCostsLabel")}
                  </Text>
                  <Text className="text-maritime-white text-sm font-medium">
                    {formatCurrency(result.portCosts)}
                  </Text>
                </View>

                <View className="border-t-2 border-maritime-teal mt-2 pt-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-maritime-white text-base font-bold">
                      {t("route.totalCost")}
                    </Text>
                    <Text className="text-maritime-teal text-xl font-bold">
                      {formatCurrency(result.totalCost)}
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Pre-Voyage Estimation */}
              <View className="mb-4">
                <Button
                  label={t("prevoyage.openButton")}
                  onPress={() => {
                    router.push({
                      pathname: "/route/prevoyage" as RelativePathString,
                      params: {
                        distance: String(result.distanceNm),
                        origin: originPort?.name ?? "",
                        destination: destinationPort?.name ?? "",
                      },
                    });
                  }}
                  variant="secondary"
                  fullWidth
                />
              </View>

              {/* Disclaimer */}
              <View className="items-center py-4 mb-8">
                <Text className="text-maritime-muted text-xs text-center">
                  {t("route.disclaimer")}
                </Text>
              </View>
            </>
          )}

          {/* Empty state */}
          {!result && !calculating && (
            <View className="items-center py-6 mb-8">
              <Text className="text-maritime-muted text-sm text-center">
                {t("route.emptyState")}
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
